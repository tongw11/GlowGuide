// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());

// Sample product data
const products = [
  {
    id: 1,
    name: 'Brand A Blush',
    price: 20,
    brand: 'brandA',
    productType: 'blush',
    rating: 4.5,
  },
  // ... Add more products as needed
];

// API Endpoint for products
app.get('/api/products', (req, res) => {
  const { search, priceRange, brand, productType, rating } = req.query;

  // Initialize filteredProducts with the full products array
  let filteredProducts = products;

  // Filter by search query
  if (search) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filter by price range
  if (priceRange) {
    switch (priceRange) {
      case 'under25':
        filteredProducts = filteredProducts.filter((product) => product.price < 25);
        break;
      case '25to50':
        filteredProducts = filteredProducts.filter(
          (product) => product.price >= 25 && product.price <= 50
        );
        break;
      case '50to100':
        filteredProducts = filteredProducts.filter(
          (product) => product.price > 50 && product.price <= 100
        );
        break;
      case '100andAbove':
        filteredProducts = filteredProducts.filter((product) => product.price > 100);
        break;
      default:
        break;
    }
  }

  // Filter by brand
  if (brand) {
    filteredProducts = filteredProducts.filter((product) => product.brand === brand);
  }

  // Filter by product type
  if (productType) {
    filteredProducts = filteredProducts.filter(
      (product) => product.productType === productType
    );
  }

  // Filter by rating
  if (rating) {
    filteredProducts = filteredProducts.filter(
      (product) => product.rating >= Number(rating)
    );
  }

  // Send the filtered products as the response
  res.json(filteredProducts);
});

// Start the Server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
