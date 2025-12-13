import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Products from "../Components/products.jsx";
import "../Style/Home.css";

const API = import.meta.env.VITE_API_URL;

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Fetch all products from backend
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  return (
    <div className="Home-container">
      <h2>Search Results for "{searchTerm}"</h2>
      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Products key={product._id || product.id} product={product} />
          ))
        ) : (
          <div className="no-products">
            <h3>❌ No products found for "{searchTerm}"</h3>
            <button className="btn" onClick={() => navigate("/")}>
              ← Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
