// src/components/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail() {
  const { productId } = useParams(); // Get productId from the URL params
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch product details from the backend
    fetch(`http://localhost:5001/api/products/${productId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Product not found');
        }
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching product details:', error);
        setIsLoading(false);
      });
  }, [productId]);

  const handleAddToWishlist = () => {
    const storedUserId = localStorage.getItem('UserId');

    if (!storedUserId) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }

    fetch('http://localhost:5001/api/users/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserId: storedUserId, ProductId: productId }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message || 'Item added to wishlist!');
      })
      .catch((error) => {
        console.error('Error adding to wishlist:', error);
        alert('An error occurred while adding the item to the wishlist.');
      });
  };

  if (isLoading) {
    return <p>Loading product details...</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  // Function to convert video links to embed URLs
  const getEmbedUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes('youtube.com')) {
        const videoId = parsedUrl.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (parsedUrl.hostname.includes('youtu.be')) {
        const videoId = parsedUrl.pathname.slice(1);
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      // Add support for other platforms if necessary
      return url; // Return original URL if not a recognized platform
    } catch (error) {
      console.error('Invalid video URL:', error);
      return url;
    }
  };

  return (
    <div className="product-detail-container">
      <h2>{product.ProductName}</h2>
      <p>
        <strong>Price:</strong> ${product.Price}
      </p>
      <p>
        <strong>Category:</strong> {product.Category}
      </p>
      
      <p><strong>Brand:</strong> {product.BrandName}</p>
      
      <p>
        <strong>Usage Frequency:</strong> {product.UsageFrequency}
      </p>
      <p>
        <strong>Skin Type:</strong> {product.SkinType}
      </p>
      <p>
        <strong>Number of Reviews:</strong> {product.NumberOfReviews}
      </p>
      <p>
        <strong>Rating:</strong> {product.Rating}
      </p>
      <p>
        <strong>Gender Target:</strong> {product.GenderTarget}
      </p>
      {/* Add other product details as necessary */}

      {/* Display Videos */}
      {product.videoLinks && product.videoLinks.length > 0 && (
        <div className="product-videos">
          <h3>Product Videos</h3>
          {product.videoLinks.map((videoLink, index) => {
            const embedUrl = getEmbedUrl(videoLink);

            return (
              <div key={index} className="video-container">
                <iframe
                  width="560"
                  height="315"
                  src={embedUrl}
                  title={`Product Video ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={handleAddToWishlist} className="wishlist-button">
        Add to Wishlist
      </button>
    </div>
  );
}

export default ProductDetail;
