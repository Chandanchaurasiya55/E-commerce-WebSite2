import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../Style/Home.css";
import Products from '../Components/products.jsx';
import bannerImg from "../assets/home-banner.jpg";
import bannerImg1 from "../assets/second.jpg";
import BannerSlider from "../Components/BannerSlider";
import Footer from "../Components/Footer.jsx";
import Navbar from "../Components/Navbar.jsx";

const API = import.meta.env.VITE_API_URL;

const Home = () => {
  const [search, setSearch] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();
  // Products fetched from backend
  const [products, setProducts] = React.useState([]);

  useEffect(() => {
  const adminToken = localStorage.getItem("sellerToken"); // or "adminToken" if you store it like that
  setIsLoggedIn(!!adminToken);
  setIsSeller(!!adminToken);

  // Listen for storage changes (admin logs in/out in another tab)
  const handleStorageChange = () => {
    const updatedAdminToken = localStorage.getItem("sellerToken");
    setIsLoggedIn(!!updatedAdminToken);
    setIsSeller(!!updatedAdminToken);
  };

  // Listen for custom admin login event
  const handleAdminLoggedIn = () => {
    const updatedAdminToken = localStorage.getItem("sellerToken");
    setIsLoggedIn(!!updatedAdminToken);
    setIsSeller(!!updatedAdminToken);
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("adminLoggedIn", handleAdminLoggedIn);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("adminLoggedIn", handleAdminLoggedIn);
  };
}, []);

  
  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Search button
  const handleSearch = () => {
    if (search.trim() === "") {
      alert("Please enter a search term");
    } else {
      setIsSearched(true);
    }
  };

  // Clear search - show all products again
  const handleClearSearch = () => {
    setSearch("");
    setIsSearched(false);
  };

  // Get filtered products only after search button is clicked
  const filteredProducts = isSearched
    ? products.filter(product => product.title.toLowerCase().includes(search.toLowerCase()))
    : [];

 

  //  Login button → navigate to auth
  const handleLoginClick = () => {
    navigate("/auth");
  };


  return (
   <div className="Home-container">
          <Navbar search={search} setSearch={setSearch} />
        <BannerSlider images={[bannerImg, bannerImg1]} interval={4500} width={1500} height={340} />
        <div className="Recomend-text">Recommended items</div>
        <div className="products-container">
    {isSearched && filteredProducts.length > 0 && (
      <div style={{gridColumn: "1 / -1", marginBottom: "20px"}}>
        <button className="btn" onClick={handleClearSearch} style={{backgroundColor: "#ff7a00", color: "white"}}>
          ← Back to All Products
        </button>
      </div>
    )}
    {!isSearched && products.map((product) => (
      <Products key={product._id || product.id} product={product} />
    ))}
    {isSearched && filteredProducts.length > 0 && filteredProducts.map((product) => (
      <Products key={product._id || product.id} product={product} />
    ))}
    {isSearched && filteredProducts.length === 0 && (
      <div className="no-products">
        <h2>❌ No products found for "{search}"</h2>
        <p>Try searching with different keywords</p>
        <button className="btn" onClick={handleClearSearch} style={{marginTop: "20px"}}>
          ← Back to All Products
        </button>
      </div>
    )}
    </div>
     <Footer/>
 </div>
 
  );
};

export default Home;
