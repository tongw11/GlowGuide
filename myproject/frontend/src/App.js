//app.js is the main file that renders the application. It contains the header and routes for the application.
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchProducts from './component/SearchProducts';
import MyProfile from './component/MyProfile';
import SignIn from './component/SignIn';
import Register from './component/Register';
import ProductDetail from './component/ProductDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        {/* Global Header */}
        <header className="header-container">
          <h1>GlowGuide</h1>
          <div className="header-links">
            <Link to="/">Home</Link>
            <Link to="/my-profile">My Profile</Link>
            <Link to="/sign-in">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SearchProducts />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<SearchProducts userId="mock-user-id" />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
