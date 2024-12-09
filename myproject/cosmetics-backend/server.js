const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const connection = require('./db'); // MySQL connection
const userRoutes = require('./user'); // User routes
const bundleRoutes = require('./bundle_back'); // Bundle management
const bundleFetchRoutes = require('./user_fetch'); // User fetch routes
const recommendation = require('./recommendation'); // Recommendations

const app = express();

const youtube = google.youtube({
  version: 'v3',
  auth: '', // Add YouTube API key here
});

app.use(cors());
app.use(express.json());

// Helper function to query the database
function queryDatabase(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

// Helper function to fetch a YouTube video link
async function fetchYouTubeVideo(searchQuery) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults: 1,
    });

    const items = response.data.items;
    if (items.length > 0) {
      const videoId = items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return null;
  } catch (error) {
    console.error('YouTube API error:', error);
    return null;
  }
}

// API Endpoint to fetch products with filters and sorting
app.get('/api/products', (req, res) => {
  const { search, priceRange, brand, productType, rating, sortBy, sortOrder } = req.query;

  // Use stored procedure for comprehensive filtering and sorting
  const storedProcParams = [
    search || '',
    priceRange || '',
    brand || '',
    productType || '',
    rating || 0,
    sortBy || '',
    sortOrder || '',
  ];

  connection.query('CALL search_product_procedure(?, ?, ?, ?, ?, ?, ?)', storedProcParams, (error, results) => {
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const products = results[0] || [];
    const summary = results[1]?.[0] || {};
    res.json({ products, summary });
  });
});

// API Endpoint for product details
app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const productQuery = `
      SELECT Products.*, Brands.BrandName
      FROM Products
      JOIN Brands ON Products.BrandId = Brands.BrandId
      WHERE Products.ProductId = ?
    `;
    const videoQuery = 'SELECT VideoLink FROM Video WHERE ProductId = ?';
    const insertVideoQuery = 'INSERT INTO Video (ProductId, VideoLink) VALUES (?, ?)';

    const productResults = await queryDatabase(productQuery, [productId]);
    if (productResults.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResults[0];
    const videoResults = await queryDatabase(videoQuery, [productId]);

    if (videoResults.length > 0) {
      product.videoLinks = videoResults.map((row) => row.VideoLink);
    } else {
      const searchQuery = `${product.BrandName} ${product.ProductName} review`;
      const videoLink = await fetchYouTubeVideo(searchQuery);

      if (videoLink) {
        await queryDatabase(insertVideoQuery, [productId, videoLink]);
        product.videoLinks = [videoLink];
      } else {
        product.videoLinks = [];
      }
    }

    // Optional: Fetch comments for the product
    const commentQuery = `
      SELECT c.CommentId, c.UserId, c.Date, c.Rating, c.CommentContent, u.UserName
      FROM Comments c
      LEFT JOIN Users u ON c.UserId = u.UserId
      WHERE c.ProductId = ?
    `;
    const commentResults = await queryDatabase(commentQuery, [productId]);

    product.comments = commentResults.map((row) => ({
      CommentId: row.CommentId,
      UserId: row.UserId,
      UserName: row.UserName,
      Date: row.Date,
      Rating: row.Rating,
      CommentContent: row.CommentContent,
    }));

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Endpoint for adding comments to a product
app.post('/api/product/:productId/comments', async (req, res) => {
  const { productId } = req.params;
  const { UserId, Rating, CommentContent } = req.body;

  if (!UserId || !Rating || !CommentContent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const insertCommentQuery = `
      INSERT INTO Comments (ProductId, UserId, Rating, CommentContent, Date)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await queryDatabase(insertCommentQuery, [productId, UserId, Rating, CommentContent]);

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
app.use('/api/users', userRoutes);

// Bundle routes
app.use('/api/bundles', bundleRoutes);
app.use('/api/fetch', bundleFetchRoutes);
app.use('/api/recommend', recommendation);

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
