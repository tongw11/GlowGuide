import React, { useEffect, useState } from 'react';
import './MyProfile.css';

function MyProfile() {
    const [wishlist, setWishlist] = useState([]);
    const UserId = localStorage.getItem('UserId'); // Get UserId from localStorage

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
        </div>
    );
}

export default MyProfile;
