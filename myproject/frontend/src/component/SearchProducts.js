import './SearchProducts.css';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';

function SearchProducts({ UserId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    brand: '',
    productType: '',
    rating: '',
    sortBy: '',
    sortOrder: '',
  });

  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({}); // To store summary info like total count
  const [isLoading, setIsLoading] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showBundles, setShowBundles] = useState(false);
  const [wishlist, setWishlist] = useState(new Set()); // Track products in wishlist


  // Handle search input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Build the query parameters
    const params = new URLSearchParams({
      search: searchQuery,
      priceRange: filters.priceRange,
      brand: filters.brand,
      productType: filters.productType,
      rating: filters.rating,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    // Fetch products from the backend
    fetch(`http://localhost:5001/api/products?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products || []);
        setSummary(data.summary || {}); // Store summary (e.g., total_products)
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        alert('An error occurred while fetching products.');
        setIsLoading(false);
      });
  };

  const handleAddToWishlist = (ProductId) => {
    const storedUserId = localStorage.getItem('UserId'); // Ensure key matches

    if (!storedUserId) {
      alert('User not logged in!');
      return;
    }

    fetch('http://localhost:5001/api/users/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ UserId: storedUserId, ProductId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert('Item added to wishlist!');
        } else {
          alert('Failed to add item to wishlist.');
        }
      })
      .catch((error) => {
        console.error('Error adding to wishlist:', error);
        alert('An error occurred while adding the item to the wishlist.');
      });
  };
  // Handle adding a product to an existing bundle
  const handleAddToBundle = (bundleId) => {
    console.log("Adding product to bundle:", { bundleId, ProductId: selectedProductId });
    const storedUserId = localStorage.getItem("UserId");
    if (!storedUserId) {
      alert("User not logged in!");
      return;
    }

    fetch(`http://localhost:5001/api/bundles/${bundleId}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ProductId: selectedProductId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("Product added to bundle!");
          setShowBundles(false);
        } else {
          alert("Failed to add product to bundle.");
        }
      })
      .catch((error) => {
        console.error("Error adding product to bundle:", error);
        alert("Failed to add product to bundle.");
      });
  };

  // Handle creating a new bundle with the selected product
  const handleCreateBundle = (ProductId) => {
    const storedUserId = localStorage.getItem("UserId");
    if (!storedUserId) {
      alert("User not logged in!");
      return;
    }

    const bundleName = prompt("Enter a name for the new bundle:");
    if (!bundleName) return;

    fetch("http://localhost:5001/api/bundles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: storedUserId,
        BundleName: bundleName,
        ProductId: ProductId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("New bundle created!");
          setShowBundles(false);
        } else {
          alert("Failed to create new bundle.");
        }
      })
      .catch((error) => {
        console.error("Error creating bundle:", error);
        alert("Failed to create new bundle.");
      });
  };

  // Handle "Add to Existing Bundle" button click
  const handleShowBundles = (ProductId) => {
    setSelectedProductId(ProductId);
    const storedUserId = localStorage.getItem("UserId");
    console.log("User ID: ", storedUserId);

    if (!storedUserId) {
      alert("User not logged in!");
      return;
    }

    fetch(`http://localhost:5001/api/fetch/${storedUserId}/bundles`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Bundles:", data); // Debugging
        setBundles(data); // Store the fetched bundles
        setShowBundles(true); // Show the bundles panel
      })
      .catch((error) => {
        console.error("Error fetching bundles:", error);
        alert("Failed to fetch bundles.");
      });
  };

  return (
    <div className="search-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome to GlowGuide!</h1>
        <p>Start to search what products is best for you!</p>
      </div>
      <h2>Find Products</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleInputChange}
        />
        <div className="filter-row">
          <select name="priceRange" onChange={handleFilterChange}>
            <option value="">Price Range</option>
            <option value="under25">Under $25</option>
            <option value="25to50">$25 to $50</option>
            <option value="50to100">$50 to $100</option>
            <option value="100andAbove">$100 and above</option>
          </select>
          <select name="brand" onChange={handleFilterChange}>
            <option value="">Brand</option>
            <option value="Drunk Elephant">Drunk Elephant</option>
            <option value="Laura Mercier">Laura Mercier</option>
            <option value="Natasha Denona">Natasha Denona</option>
            <option value="Ilia Beauty">Ilia Beauty</option>
            <option value="Charlotte Tilbury">Charlotte Tilbury</option>
            <option value="Danessa Myricks">Danessa Myricks</option>
            <option value="Bourjois">Bourjois</option>
            <option value="IT Cosmetics">IT Cosmetics</option>
            <option value="Fenty Beauty">Fenty Beauty</option>
            <option value="Sisley">Sisley</option>
          </select>
          <select name="productType" onChange={handleFilterChange}>
            <option value="">Product Type</option>
            <option value="blush">Blush</option>
            <option value="makeupRemover">Makeup Remover</option>
            <option value="highlighter">Highlighter</option>
            <option value="faceMask">Face Mask</option>
            <option value="foundation">Foundation</option>
            <option value="powder">Powder</option>
            <option value="lipGloss">Lip Gloss</option>
            <option value="ccCream">CC Cream</option>
            <option value="eyeShadow">Eye Shadow</option>
            <option value="concealer">Concealer</option>
            <option value="eyeliner">Eyeliner</option>
            <option value="lipstick">Lipstick</option>
            <option value="settingSpray">Setting Spray</option>
            <option value="cleanser">Cleanser</option>
            <option value="bronzer">Bronzer</option>
            <option value="primer">Primer</option>
            <option value="faceOil">Face Oil</option>
            <option value="contour">Contour</option>
            <option value="mascara">Mascara</option>
            <option value="bbCream">BB Cream</option>
            <option value="lipLiner">Lip Liner</option>
            <option value="moisturizer">Moisturizer</option>
            <option value="exfoliator">Exfoliator</option>
          </select>
          <select name="rating" onChange={handleFilterChange}>
            <option value="">Rating</option>
            <option value="4">⭐⭐⭐⭐ 4 &amp; up</option>
            <option value="3">⭐⭐⭐ 3 &amp; up</option>
            <option value="2">⭐⭐ 2 &amp; up</option>
            <option value="1">⭐ 1 &amp; up</option>
          </select>
          <select name="sortBy" onChange={handleFilterChange}>
            <option value="">Sort By</option>
            <option value="Price">Price</option>
            <option value="Rating">Rating</option>
          </select>
          <select name="sortOrder" onChange={handleFilterChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <button type="submit">Search</button>
      </form>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="results-container">
          <h3>Results</h3>
          {/* Display the product count if available */}
          {summary.total_products !== undefined && (
            <p>Total Products Found: {summary.total_products}</p>
          )}
          <ul className="product-list">
            {products.length > 0 ? (
              products.map((product) => (
                <li key={product.ProductId} className="product-card">
                  <div className="product-header">
                    <h4 className="product-name">{product.ProductName}</h4>
                    <span className="product-price">${product.Price}</span>
                  </div>
                  <div className="product-details">
                    <p><strong>Category:</strong> {product.Category}</p>
                    <p><strong>Brand:</strong> {product.BrandName}</p>
                    <p><strong>Usage Frequency:</strong> {product.UsageFrequency}</p>
                    <p><strong>Skin Type:</strong> {product.SkinType}</p>
                    <p><strong>Number of Reviews:</strong> {product.NumberOfReviews}</p>
                    <p><strong>Rating:</strong> {product.Rating}</p>
                    <p><strong>Gender Target:</strong> {product.GenderTarget}</p>
                  </div>
                  <button
                    onClick={() => handleAddToWishlist(product.ProductId)}
                    className="wishlist-button"
                  >
                    {wishlist.has(product.ProductId)
                      ? <span role="img" aria-label="added to wishlist">❤️</span>  // Red heart if already in wishlist
                      : 'Add to Wishlist'}
                  </button>
                  <button
                    onClick={() => handleShowBundles(product.ProductId)}
                    className="bundle-button"
                  >
                    Add to Existing Bundle
                  </button>
                  <button
                    onClick={() => handleCreateBundle(product.ProductId)}
                    className="bundle-button"
                  >
                    Create New Bundle
                  </button>
                  <Link to={`/product/${product.ProductId}`} className="detail-button">
                    View Details
                  </Link>
                </li>
              ))
            ) : (
              <li>No products found.</li>
            )}
          </ul>
        </div>
      )}
      {showBundles && (
        <div className="bundles-panel">
          <h3>Your Bundles</h3>

          <ul className="bundle-list">
            {bundles.length > 0 ? (
              bundles.map((bundle) => (
                <li key={bundle.BundledId} className="bundle-item">
                  <div className="bundle-info">
                    <span className="bundle-name">{bundle.BundleName}</span>
                    <button
                      onClick={() => handleAddToBundle(bundle.BundledId)}
                      className="add-to-bundle-button"
                    >
                      Add to Bundle
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className="no-bundles-message">No bundles available.</p>
            )}
          </ul>

          <button
            onClick={() => setShowBundles(false)}
            className="close-panel-button"
          >
            Close
          </button>
        </div>
      )}

    </div>
  );
}


export default SearchProducts;
