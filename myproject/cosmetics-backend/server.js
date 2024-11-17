// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Enable CORS

// API Endpoint
app.get('/api/data', (req, res) => {// Change the URL to your frontend server
  res.json({ message: 'Hello from the backend!' });// Send a JSON response
});

// Start the Server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
