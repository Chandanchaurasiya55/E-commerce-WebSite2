import React, { useState, useEffect } from 'react'
import '../Style/products.css'
import { useNavigate } from 'react-router-dom';

const Products = ({ product }) => {
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let t;
    if (added) t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  const openProductDetail = () => {
    const id = product._id || product.id;
    if (!id) return;
    navigate(`/product/${id}`, { state: { product } });
  };


  const images = (product.images && product.images.length) ? product.images : (product.img ? [product.img] : []);

  return (
    <div className='products'>
      <div className='productCard' onClick={openProductDetail} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') openProductDetail(); }} style={{cursor:'pointer'}}>
        <img src={images[0] || '/placeholder-product.svg'} alt={product.title} className='productImage' />   

        <h3 className='productTitle'>{product.title}</h3>
        <p className='productPrice'>{product.price}</p>
        
        {(added || errorMsg) && (
          <div className={`cart-status ${added ? 'success' : errorMsg ? 'error' : ''}`}>{added ? 'Added to cart' : errorMsg}</div>
        )}
      </div>   
    </div>
  )
}
export default Products
