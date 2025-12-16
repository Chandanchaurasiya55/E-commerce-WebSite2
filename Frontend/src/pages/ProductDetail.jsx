import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../Style/ProductDetail.css';
import Orderform from "../pages/Orderform.jsx";
import Footer from "../Components/Footer.jsx"
import Navbar from "../Components/Navbar.jsx";

const API = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [mainImage, setMainImage] = useState(null);
  const [actionState, setActionState] = useState({ adding: false, added: false, buyNowLoading: false });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      const imgs = (product.images && product.images.length) ? product.images : (product.img ? [product.img] : []);
      setMainImage(imgs[0] || null);
      return; // already have product via navigation state
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.product || null);
      } catch (err) {
        console.error(err);
        setError('Could not load product details');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // whenever product changes (e.g., fetched) set the default main image
  useEffect(() => {
    if (!product) return;
    const imgs = (product.images && product.images.length) ? product.images : (product.img ? [product.img] : []);
    setMainImage(imgs[0] || null);
  }, [product]);

  if (loading) return <div className="product-detail">Loading product…</div>;
  if (error) return <div className="product-detail error">{error}</div>;
  if (!product) return <div className="product-detail">Product not found.</div>;

  return (
    <>
      <Navbar />
    <div className="product-detail">
      <div className="detail-header">
        <div className="detail-image-wrap">
          <img src={mainImage || product.img || '/placeholder-product.svg'} alt={product.title} className="detail-image" />
          {/* image selector dots (click to change main image) */}
          {(product.images && product.images.length > 0) && (
            <div className="image-dots">
              {product.images.slice(0, 2).map((it, idx) => (
                <div
                  key={idx}
                  role="button"
                  aria-label={`Show image ${idx + 1}`}
                  className={`image-dot ${it === mainImage ? 'active' : ''}`}
                  onClick={() => setMainImage(it)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMainImage(it) }}
                  tabIndex={0}
                />
              ))}
            </div>
          )}
        </div>

          <div className="detail-meta">
          <h1 className="detail-title">{product.title}</h1>
          {product.price && <div className="detail-price">{product.price}</div>}
          
          <Orderform product={product} />
         

          
        </div>
      </div>

    </div>

    <div className="detail-about">
            <h3>About</h3>
            <p>{product.description || 'No additional information provided for this product.'}</p>
    </div>
    <Footer />
</>

  );
};

export default ProductDetail;
