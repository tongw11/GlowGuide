const express = require('express');
const router = express.Router();

// Import the database connection
const connection = require('./db');

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

// API Endpoint to add a product to an existing bundle
router.post('/:bundleId/add', (req, res) => {
  const { bundleId } = req.params;
  const { ProductId } = req.body;
  console.log("ProductId is: ", ProductId);

  const query = 'INSERT INTO BundleProducts (BundledId, ProductId) VALUES (?, ?)';
  connection.query(query, [bundleId, ProductId], (error, results) => {
    if (error) {
      console.error('Error adding product to bundle:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Product added to bundle successfully' });
  });
});

// API Endpoint to create a new bundle
router.post('/', (req, res) => {
  const { UserId, BundleName, ProductId } = req.body;

  const insertBundleQuery = 'INSERT INTO Bundles (UserId, BundleName) VALUES (?, ?)';

  // Insert the new bundle
  connection.query(insertBundleQuery, [UserId, BundleName], (error, bundleResults) => {
    if (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const BundledId = bundleResults.insertId;

    // Add the product to the new bundle
    const insertProductQuery = 'INSERT INTO BundleProducts (BundledId, ProductId) VALUES (?, ?)';
    connection.query(insertProductQuery, [BundledId, ProductId], (error) => {
      if (error) {
        console.error('Error adding product to bundle:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      res.json({ message: 'Bundle created and product added successfully' });
    });
  });
});

module.exports = router;


