
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import SearchProducts from './component/SearchProducts';
// import MyProfile from './component/MyProfile';
// import SignIn from './component/SignIn';
// import Register from './component/Register';
// import Bundle from './component/Bundle';
// import ProductDetail from './component/ProductDetail';
// import './App.css';

// function App() {
//   return (
//     <Router>
//       <div>
//         {/* Global Header */}
//         <header className="header-container">
//           <h1>GlowGuide</h1>
//           <div className="header-links">
//             <Link to="/">Home</Link>
//             <Link to="/bundle">Bundle</Link>
//             <Link to="/my-profile">My Profile</Link>
//             <Link to="/sign-in">Sign In</Link>
//             <Link to="/register">Register</Link>
//           </div>
//         </header>

//         {/* Routes */}
//         <Routes>
//           <Route path="/" element={<SearchProducts />} />
//           <Route path="/my-profile" element={<MyProfile />} />
//           <Route path="/sign-in" element={<SignIn />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/bundle" element={<Bundle />} />
//           <Route path="/" element={<SearchProducts userId="mock-user-id" />} />
//           <Route path="/product/:productId" element={<ProductDetail />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchProducts from './component/SearchProducts';
import MyProfile from './component/MyProfile';
import SignIn from './component/SignIn';
import Register from './component/Register';
import Bundle from './component/Bundle';
import ProductDetail from './component/ProductDetail';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('username');
    setIsLoggedIn(!!user);
    setUsername(user);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('UserId');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername(null);
  };

  return (
    <Router>
      <div>
        {/* Global Header */}
        <header className="header-container">
          <h1>GlowGuide</h1>
          <div className="header-links">
            <Link to="/">Home</Link>
            <Link to="/bundle">Bundle</Link>
            <Link to="/my-profile">My Profile</Link>
            {isLoggedIn ? (
              <>
                <span>Welcome, {username}!</span>
                <button onClick={handleSignOut} className="sign-out-button">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/sign-in">Sign In</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SearchProducts />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bundle" element={<Bundle />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
