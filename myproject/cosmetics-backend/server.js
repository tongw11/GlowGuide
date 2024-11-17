// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Import the database connection
const connection = require('./db');

app.use(cors());
app.use(express.json());

// API Endpoint for products
app.get('/api/products', (req, res) => {
  const { search, priceRange, brand, productType, rating } = req.query;

  let query = 'SELECT * FROM Products WHERE 1=1';
  const params = [];

  // Filter by search query (ProductName)
  if (search) {
    query += ' AND ProductName LIKE ?';
    params.push(`%${search}%`);
  }

  // Filter by price range
  if (priceRange) {
    switch (priceRange) {
      case 'under25':
        query += ' AND Price < 25';
        break;
      case '25to50':
        query += ' AND Price BETWEEN 25 AND 50';
        break;
      case '50to100':
        query += ' AND Price BETWEEN 50 AND 100';
        break;
      case '100andAbove':
        query += ' AND Price > 100';
        break;
      default:
        break;
    }
  }

  // Filter by brand (BrandId)
  if (brand) {
    // Map frontend brand values to BrandIds
    const brandMapping = {
      brandA: 1,
      brandB: 2,
      brandC: 3,
      brandD: 4,
      brandE: 5,
      brandF: 6,
      brandG: 7,
      brandH: 8,
      brandI: 9,
      brandJ: 10
    };
    const brandId = brandMapping[brand];
    if (brandId) {
      query += ' AND BrandId = ?';
      params.push(brandId);
    }
  }

  // Filter by product type (Category)
  if (productType) {
    // Map frontend productType values to database categories
    const productTypeMapping = {
      blush: 'Blush',
      makeupRemover: 'Makeup Remover',
      highlighter: 'Highlighter',
      faceMask: 'Face Mask',
      foundation: 'Foundation',
      powder: 'Powder',
      lipGloss: 'Lip Gloss',
      ccCream: 'CC Cream',
      eyeShadow: 'Eye Shadow',
      concealer: 'Concealer',
      eyeliner: 'Eyeliner',
      lipstick: 'Lipstick',
      settingSpray: 'Setting Spray',
      cleanser: 'Cleanser',
      bronzer: 'Bronzer',
      primer: 'Primer',
      faceOil: 'Face Oil',
      contour: 'Contour',
      mascara: 'Mascara',
      bbCream: 'BB Cream',
      lipLiner: 'Lip Liner',
      moisturizer: 'Moisturizer',
      exfoliator: 'Exfoliator',
    };
    const category = productTypeMapping[productType];
    if (category) {
      query += ' AND Category = ?';
      params.push(category);
    }
  }

  // Filter by rating
  if (rating) {
    query += ' AND Rating >= ?';
    params.push(Number(rating));
  }

  // Execute the query
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// Start the Server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
