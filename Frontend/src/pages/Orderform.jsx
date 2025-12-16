import React, { useState } from "react";
import "../Style/orderform.css";
import { useNavigate } from 'react-router-dom';

const OrderForm = ({ product }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    quantity: "1",
    emirates: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('userToken');

    try {
      setLoading(true);
      const API = import.meta.env.VITE_API_URL;

      // Build items array: if product prop passed use buy-now flow, otherwise rely on cart in backend
      let items = [];
      if (product && product._id) {
        items = [{
          product: product._id,
          title: product.title || product.name || 'Product',
          price: product.price || '0',
          images: product.images || (product.img ? [product.img] : []),
          quantity: Number(formData.quantity) || 1
        }];
      }

      const address = {
        name: formData.fullName,
        street: formData.address,
        city: formData.emirates,
        country: 'UAE',
        phone: formData.mobile
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API}/api/order/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items, address, paymentMethod: 'cod' }),
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || 'Failed to place order';
        setError(msg);
        return;
      }

  alert('Order placed successfully');
  // if user is logged in navigate to their orders, otherwise go to home
  if (token) navigate('/orders'); else navigate('/');
    } catch (err) {
      console.error('order submit failed', err);
      setError(err?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>

      {/* Full Name */}
      <label>
        Full Name<span>*</span>
      </label>
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        required
      />

      {/* Mobile */}
      <label>
        Mobile<span>*</span>
      </label>
      <div className="mobile-field">
        <span className="country-code">+971</span>
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
        />
      </div>

      {/* Quantity */}
      <label>
        Quantity<span>*</span>
      </label>
      <select
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        required
      >
        <option value="">-Select-</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>

      {/* Emirates */}
      <label>
        Emirates<span>*</span>
      </label>
      <select
        name="emirates"
        value={formData.emirates}
        onChange={handleChange}
        required
      >
        <option value="">-Select-</option>
        <option value="Dubai">Dubai</option>
        <option value="Abu Dhabi">Abu Dhabi</option>
        <option value="Sharjah">Sharjah</option>
        <option value="Ajman">Ajman</option>
      </select>

      {/* Address */}
      <label>
        Delivery Address<span>*</span>
      </label>
      <textarea
        name="address"
        placeholder="Delivery Address"
        value={formData.address}
        onChange={handleChange}
        required
      />

      {error && <div className="form-error">{error}</div>}

      <button type="submit" disabled={loading}>{loading ? 'Placing…' : 'Submit Order'}</button>
    </form>
  );
};

export default OrderForm;
