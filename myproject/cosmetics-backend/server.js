// server.js

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const connection = require('./db'); // Make sure this exports a working MySQL connection
const userRoutes = require('./user'); // Adjust if needed

const youtube = google.youtube({
  version: 'v3',
  auth: '' // Insert your YouTube API Key if required
});

const app = express();
app.use(cors());
app.use(express.json());

// Route to search products using the stored procedure
app.get('/api/products', (req, res) => {
  const { search, priceRange, brand, productType, rating, sortBy, sortOrder } = req.query;

  // Define default values if parameters are not provided
  const params = [
    search || '',       // p_search
    priceRange || '',   // p_priceRange
    brand || '',        // p_brand
    productType || '',  // p_productType
    rating || 0,        // p_rating
    sortBy || '',       // p_sortBy
    sortOrder || ''     // p_sortOrder
  ];

  // Call the stored procedure. This procedure returns multiple result sets:
  //  - The first result set: list of products
  //  - The second result set: possibly a summary or count (as per the example logic)
  connection.query('CALL search_product_procedure(?, ?, ?, ?, ?, ?, ?)', params, (error, results) => {
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // results is an array of arrays because of multiple SELECT statements.
    // For example:
    // results[0] = the products
    // results[1] = the summary/count result
    const products = results[0] || [];
    let summary = {};
    if (results[1] && results[1].length > 0) {
      summary = results[1][0]; // e.g., { total_products: 10 }
    }

    // You can return both products and summary to the client:
    res.json({
      products,
      summary
    });
  });
});

// User routes
app.use('/api/users', userRoutes);

// Fetch product details by ProductId and possibly fetch a YouTube video link
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
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (productResults.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResults[0];

    // Check if a video link already exists for this product
    connection.query(videoQuery, [productId], (videoError, videoResults) => {
      if (videoError) {
        console.error('Error fetching video links:', videoError);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (videoResults.length > 0) {
        // Video link exists
        product.videoLinks = videoResults.map((row) => row.VideoLink);
        return res.json(product);
      } else {
        // No video link exists, fetch from YouTube
        const searchQuery = `${product.BrandName} ${product.ProductName} review`;
        youtube.search.list({
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults: 1,
        }, (err, response) => {
          if (err) {
            console.error('YouTube API error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          const items = response.data.items;
          if (items && items.length > 0) {
            const videoId = items[0].id.videoId;
            const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

            // Save the video link to the database
            connection.query(insertVideoQuery, [productId, videoLink], (insertError) => {
              if (insertError) {
                console.error('Error inserting video link:', insertError);
                return res.status(500).json({ error: 'Internal server error' });
              }

              product.videoLinks = [videoLink];
              return res.json(product);
            });
          } else {
            // No video found, return product without videoLinks
            product.videoLinks = [];
            return res.json(product);
          }
        });
      }
    });
  });
});

// Start the Server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
