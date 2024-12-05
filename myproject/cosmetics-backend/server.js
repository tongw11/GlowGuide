// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: '', 
});

// Import the database connection
const connection = require('./db');

// Import user routes
const userRoutes = require('./user');

app.use(cors());
app.use(express.json());

// API Endpoint for products
app.get('/api/products', (req, res) => {
  const { search, priceRange, brand, productType, rating, sortBy, sortOrder } = req.query;


  let query = `
    SELECT Products.*, Brands.BrandName 
    FROM Products 
    JOIN Brands ON Products.BrandId = Brands.BrandId 
    WHERE 1=1
  `;
  const params = [];

  // Filter by search query (ProductName)
  if (search) {
    query += ' AND Products.ProductName LIKE ?';
    params.push(`%${search}%`);
  }
  if (brand) {
    query += ' AND Brands.BrandName = ?';
    params.push(brand);
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

  // Add sorting
  if (sortBy) {
    const validSortFields = ['Price', 'Rating'];
    if (validSortFields.includes(sortBy)) {
      const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${sortBy} ${order}`;
    }
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

// User routes
app.use('/api/users', userRoutes);

// API Endpoint for product details
app.get('/api/products/:productId', (req, res) => {
  const { productId } = req.params;

  const productQuery = `
    SELECT Products.*, Brands.BrandName 
    FROM Products 
    JOIN Brands ON Products.BrandId = Brands.BrandId 
    WHERE Products.ProductId = ?
  `;
  const videoQuery = 'SELECT VideoLink FROM Video WHERE ProductId = ?';
  const insertVideoQuery = 'INSERT INTO Video (ProductId, VideoLink) VALUES (?, ?)';

  // Fetch product details
  connection.query(productQuery, [productId], (error, productResults) => {
    if (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (productResults.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = productResults[0];

    // Check if a video link already exists for this product
    connection.query(videoQuery, [productId], (videoError, videoResults) => {
      if (videoError) {
        console.error('Error fetching video links:', videoError);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      if (videoResults.length > 0) {
        // Video link exists, add it to the product object
        product.videoLinks = videoResults.map((row) => row.VideoLink);
        res.json(product);
      } else {
        // No video link exists, fetch from YouTube
        const searchQuery = `${product.BrandName} ${product.ProductName} review`;

        youtube.search.list(
          {
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            maxResults: 1,
          },
          (err, response) => {
            if (err) {
              console.error('YouTube API error:', err);
              res.status(500).json({ error: 'Internal server error' });
              return;
            }

            const items = response.data.items;
            if (items.length > 0) {
              const videoId = items[0].id.videoId;
              const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

              // Save the video link to the database
              connection.query(insertVideoQuery, [productId, videoLink], (insertError) => {
                if (insertError) {
                  console.error('Error inserting video link:', insertError);
                  res.status(500).json({ error: 'Internal server error' });
                  return;
                }

                product.videoLinks = [videoLink];
                res.json(product);
              });
            } else {
              // No video found, return product without videoLinks
              product.videoLinks = [];
              res.json(product);
            }
          }
        );
      }
    });
  });
});


// Start the Server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
