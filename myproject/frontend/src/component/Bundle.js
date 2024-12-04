import React, { useState, useEffect } from "react";
import "./Bundle.css";

const BundlesPage = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/bundles");
        if (!response.ok) {
          throw new Error("Failed to fetch bundles");
        }
        const data = await response.json();
        setBundles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>All Bundles</h1>
      {bundles.length === 0 ? (
        <p>No bundles available</p>
      ) : (
        <div className="bundles-list">
          {bundles.map((bundle) => (
            <div key={bundle.BundledId} className="bundle-card">
            <h2>{bundle.BundleName}</h2> 
              <p>Created by: {bundle.Creator}</p>
              <h3>Products:</h3>
              <p>{bundle.Products}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BundlesPage;
