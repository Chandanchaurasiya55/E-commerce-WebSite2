import React, { useEffect, useState } from 'react';
import '../Style/Home.css';
import Products from '../Components/products.jsx';
import Navbar from '../Components/Navbar.jsx';
import Footer from '../Components/Footer.jsx';

const API = import.meta.env.VITE_API_URL;

const AllProducts = () => {
  const [search, setSearch] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [products, setProducts] = useState([]);

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

  const filteredProducts = isSearched
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="AllProducts-page">
      <Navbar search={search} setSearch={(v)=>{ setSearch(v); setIsSearched(false); }} />

      <div className="container">
        <header style={{marginTop:20, marginBottom:10}}>
          <h1>All Products</h1>
          <p className="sub">Browse all available products</p>
        </header>

        <div className="Recomend-text">Products</div>

        <div className="products-container">
          {isSearched && filteredProducts.length > 0 && (
            <div style={{gridColumn: '1 / -1', marginBottom: 20}}>
              <button className="btn" onClick={() => { setSearch(''); setIsSearched(false); }} style={{backgroundColor: '#ff7a00', color: 'white'}}>
                ← Back to All Products
              </button>
            </div>
          )}

          {!isSearched && products.map(product => (
            <Products key={product._id || product.id} product={product} />
          ))}

          {isSearched && filteredProducts.length > 0 && filteredProducts.map(product => (
            <Products key={product._id || product.id} product={product} />
          ))}

          {isSearched && filteredProducts.length === 0 && (
            <div className="no-products">
              <h2>❌ No products found for "{search}"</h2>
              <p>Try searching with different keywords</p>
              <button className="btn" onClick={() => { setSearch(''); setIsSearched(false); }} style={{marginTop: 20}}>← Back to All Products</button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AllProducts;
