// src/App.js
import React, { useState, useEffect } from 'react';

function App() {
  const [backendData, setBackendData] = useState({});

  useEffect(() => {
    fetch('http://localhost:5001/api/data')// Change the URL to your backend server
      .then(response => response.json())// Parse the JSON data
      .then(data => setBackendData(data));// Set the data to the backendData state
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>React Frontend</h1>
      <p>{backendData.message}</p>
    </div>
  );
}

export default App;
