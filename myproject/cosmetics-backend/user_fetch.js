const express = require('express');
const router = express.Router();
const connection = require('./db');

// Endpoint to fetch all bundles created by a specific user
router.get('/:userId/bundles', (req, res) => {
  const { userId } = req.params;

  // Query to get all bundles for the user, including product names in each bundle
  const query = `
    SELECT 
        b.BundledId,
        b.BundleName,
        GROUP_CONCAT(p.ProductName SEPARATOR ', ') AS Products
    FROM 
        Bundles b
    LEFT JOIN 
        BundleProducts bp ON b.BundledId = bp.BundledId
    LEFT JOIN 
        Products p ON bp.ProductId = p.ProductId
    WHERE 
        b.UserId = ?
    GROUP BY 
        b.BundledId, b.BundleName
  `;

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching bundles for user:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json(results);
  });
});

module.exports = router;
