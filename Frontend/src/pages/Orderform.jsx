import React, { useState } from "react";
import "../Style/orderform.css";

const OrderForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    quantity: "",
    emirates: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
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

      <button type="submit">Submit Order</button>
    </form>
  );
};

export default OrderForm;
