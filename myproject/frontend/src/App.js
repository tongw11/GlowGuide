// src/App.js
import React from 'react';
import './App.css';
import SearchProducts from './SearchProducts';

function App() {
  return (
    <div>
      <div className="title-container">
        <h1>GlowGuide - Beauty &amp; Cosmetics Recommendations</h1>
      </div>
      <SearchProducts />
    </div>
  );
}

export default App;
