const express = require('express');
const router = express.Router();

// Import the database connection
const connection = require('./db');

const executeQuery = (connection, query, params) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// API Endpoint to get all bundles
router.get('/', (req, res) => {
  const { creator } = req.query;

  // Base query for fetching bundles
  let query = `
    SELECT 
        b.BundledId,
        b.BundleName,
        u.UserId AS CreatorId,
        u.UserName AS Creator,
        GROUP_CONCAT(p.ProductName SEPARATOR ', ') AS Products
    FROM 
        Bundles b
    JOIN 
        Users u ON b.UserId = u.UserId
    LEFT JOIN 
        BundleProducts bp ON b.BundledId = bp.BundledId
    LEFT JOIN 
        Products p ON bp.ProductId = p.ProductId
    WHERE 1=1
  `;
  const params = [];

  // Filter by creator if specified
  if (creator) {
    query += ' AND u.UserName = ?';
    params.push(creator);
  }

  // Group the results by BundledId
  query += ' GROUP BY b.BundledId, b.BundleName, u.UserId, u.UserName';

  // Execute the query
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching bundles:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

router.post('/:bundleId/add', async (req, res) => {
  const { bundleId } = req.params;
  const { ProductId } = req.body;

  try {
    // Set isolation level BEFORE starting the transaction
    await executeQuery(connection, `SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ`);

    // Begin the transaction
    await new Promise((resolve, reject) =>
      connection.beginTransaction((err) => (err ? reject(err) : resolve()))
    );

    // Insert into BundleProducts
    const query = 'INSERT INTO BundleProducts (BundledId, ProductId) VALUES (?, ?)';
    await executeQuery(connection, query, [bundleId, ProductId]);

    // Commit transaction
    await new Promise((resolve, reject) =>
      connection.commit((err) => (err ? reject(err) : resolve()))
    );

    res.json({ message: 'Product added to bundle successfully' });
  } catch (error) {
    // Rollback transaction on any error
    await new Promise((resolve) =>
      connection.rollback(() => resolve())
    );
    console.error('Transaction failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Endpoint to create a new bundle
router.post('/', async (req, res) => {
  const { UserId, BundleName, ProductId } = req.body;

  try {
    // Set isolation level BEFORE starting the transaction
    await executeQuery(connection, `SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE`);

    // Begin the transaction
    await new Promise((resolve, reject) =>
      connection.beginTransaction((err) => (err ? reject(err) : resolve()))
    );

    // Insert the new bundle
    const insertBundleQuery = 'INSERT INTO Bundles (UserId, BundleName) VALUES (?, ?)';
    const bundleResults = await executeQuery(connection, insertBundleQuery, [UserId, BundleName]);
    const BundledId = bundleResults.insertId;

    // Add the product to the new bundle
    const insertProductQuery = 'INSERT INTO BundleProducts (BundledId, ProductId) VALUES (?, ?)';
    await executeQuery(connection, insertProductQuery, [BundledId, ProductId]);

    // Commit the transaction
    await new Promise((resolve, reject) =>
      connection.commit((err) => (err ? reject(err) : resolve()))
    );

    res.json({ message: 'Bundle created and product added successfully' });
  } catch (error) {
    // Rollback transaction on any error
    await new Promise((resolve) =>
      connection.rollback(() => resolve())
    );
    console.error('Transaction failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;


