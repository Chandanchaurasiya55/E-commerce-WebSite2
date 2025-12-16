import React, { useState } from "react";
import "../Style/Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    if (search.trim() === "") return alert("Please enter a search term");
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="Navbar">
      <div className="Navbar-container">
        <div className="nav-left">
          <h2 className="logo" onClick={() => navigate("/")}>
            BUIMB TECHNOLOGY
          </h2>
        </div>
        <div className="nav-center">
          <input
            type="search"
            placeholder="Search Any Things..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className="home-subnav">
        <div className="home-subnav-inner">
          <button className="home-subnav-link" onClick={() => navigate("/")}>
            Home
          </button>
          <button
            className="home-subnav-link"
            onClick={() => navigate(`/products`)}
          >
            All Products
          </button>
          <button className="home-subnav-link" onClick={() => navigate("/#")}> 
            Deals
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
