import React, { useEffect, useState } from 'react';
import '../Style/AdminDashboard.css';
import '../Style/AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('fetch admin products', err);
      } finally { setLoading(false); }
    };

    fetchProducts();
  }, []);

  const remove = async (id) => {
    if (!confirm('Delete product? This is permanent.')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return alert('Admin login required');
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/admin/product/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Failed to delete');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) { console.error(err); alert('Failed to delete product'); }
  };

  return (
    <div className="admin-products">
      <header className="orders-header">
        <div>
          <h1>Products</h1>
          <p className="sub">Manage products you uploaded — quick edit and delete</p>
        </div>
        <div className="actions"><div className="total-stat">{products.length} items</div></div>
      </header>

      {loading ? (
        <div className="orders-empty">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="orders-empty">You have not uploaded any products yet.</div>
      ) : (
        <div className="products-grid">
          {products.map(p => (
            <article className="product-card admin" key={p._id}>
              <img src={(p.images && p.images.length ? p.images[0] : p.img) || '/placeholder-product.png'} alt={p.title} />
              <div className="product-meta">
                <div className="title">{p.title}</div>
                <div className="price">${p.price}</div>
              </div>
              <div className="product-actions">
                <button className="btn-sm" onClick={() => navigator.clipboard?.writeText(p._id || '') || alert('Copied id')}>Copy ID</button>
                <button className="btn-sm btn-danger" onClick={() => remove(p._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
