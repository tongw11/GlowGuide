import React, { useEffect, useState } from 'react';
import './MyProfile.css';

function MyProfile() {
    const [wishlist, setWishlist] = useState([]);
    const [bundles, setBundles] = useState([]);
    const UserId = localStorage.getItem('UserId'); // Get UserId from localStorage
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        if (UserId) {
            fetch(`http://localhost:5001/api/users/wishlist/${UserId}`)
                .then((response) => response.json())
                .then((data) => {
                    setWishlist(data);
                })
                .catch((error) => {
                    console.error('Error fetching wishlist:', error);
                });

            // Fetch Bundles
            fetch(`http://localhost:5001/api/fetch/${UserId}/bundles`)
                .then((response) => response.json())
                .then((data) => {
                    setBundles(data);
                })
                .catch((error) => {
                    console.error('Error fetching bundles:', error);
                });
            
            //Fetch Recommend Prodcuts
            fetch(`http://localhost:5001/api/recommend/${UserId}/recommendations`)
                .then((response) => response.json())
                .then((data) => {
                    setRecommendedProducts(data);
                })
                .catch((error) => {
                    console.error('Error fetching recommended products:', error);
                });
        }
    }, [UserId]);

    return (
        <div className="profile-container">
            <h1 className="profile-greeting">Hi, {localStorage.getItem('username')}!</h1>
            <p className="profile-subtext">Welcome to your profile!</p>

            <h2>Your Wishlist</h2>
            {wishlist.length > 0 ? (
                <ul className="wishlist">
                    {wishlist.map((item) => (
                        <li key={item.RecordId} className="wishlist-item">
                            <h3>{item.ProductName}</h3>
                            <p><strong>Price:</strong> ${item.Price}</p>
                            <p><strong>Category:</strong> {item.Category}</p>
                            <p><strong>Brand ID:</strong> {item.BrandId}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your wishlist is empty.</p>
            )}

        <h2>Your Bundles</h2>
        <div className="bundles-container">
        {bundles.length > 0 ? (
            bundles.map((bundle) => (
            <div key={bundle.BundledId} className="bundle-card">
                <h3 className="bundle-name">{bundle.BundleName}</h3>
                <p><strong>Products:</strong> {bundle.Products || "No products in this bundle yet"}</p>
            </div>
            ))
        ) : (
        <p>You have not created any bundles yet.</p>
        )}
        </div>

        <div className="recommendation-container">
        <h2>Recommended Products</h2>
        <div className="recommendation-list">
        {recommendedProducts.map((product) => (
            <div key={product.ProductId} className="recommendation-card">
                <h3>{product.ProductName}</h3>
                    <p><strong>Price:</strong> ${product.Price}</p>
                    <p><strong>Category:</strong> {product.Category}</p>
                    <p><strong>Brand:</strong> {product.BrandName}</p>
            </div>
        ))}
        </div>
        </div>

        </div>
    );
}

export default MyProfile;
