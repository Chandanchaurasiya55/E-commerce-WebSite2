import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Style/Home.css';

const OrderPlaced = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order || null;

  if (!order) {
    return (
      <div className="container" style={{padding:40}}>
        <h2 style={{textAlign:'center'}}>Order placed</h2>
        <p style={{textAlign:'center'}}>No order details available.</p>
        <div style={{display:'flex',justifyContent:'center',marginTop:20}}>
          <button className="btn" onClick={() => navigate('/')}>Continue shopping</button>
        </div>
      </div>
    );
  }

  const total = order.totalAmount ?? order.total ?? 0;

  return (
    <div className="container" style={{padding:20}}>
      <h2 style={{textAlign:'center',marginTop:8}}>Thank you — your order is placed</h2>

      <div style={{maxWidth:900,margin:'18px auto',padding:18,border:'1px solid #e6e6e6',borderRadius:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:14,color:'#64748b'}}>Order ID</div>
            <div style={{fontWeight:800}}>{String(order._id)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:14,color:'#64748b'}}>Placed</div>
            <div>{new Date(order.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <div style={{marginTop:14}}>
          <h4>Items</h4>
          <div>
            {(order.items || []).map(it => (
              <div key={String(it.product)} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <img src={it.img || '/placeholder.png'} alt={it.title} style={{width:64,height:64,objectFit:'cover',borderRadius:6}} />
                  <div>
                    <div style={{fontWeight:700}}>{it.title || 'Untitled'}</div>
                    <div style={{color:'#64748b',fontSize:13}}>{it.quantity} × {typeof it.price === 'string' ? it.price.replace(/^\s*\$/,'AED ') : `AED ${it.price}`}</div>
                  </div>
                </div>
                <div style={{fontWeight:800}}>{typeof it.price === 'string' ? it.price.replace(/^\s*\$/,'AED ') : `AED ${parseFloat(it.price||0).toFixed(2)}`}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18}}>
          <div>
            <div style={{fontSize:13,color:'#64748b'}}>Shipping</div>
            {order.shippingAddress ? (
              <div style={{marginTop:6}}>
                <div>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.street}</div>
                <div>{[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')} {order.shippingAddress.postalCode||''}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            ) : <div className="muted">No shipping info</div>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,color:'#64748b'}}>Total</div>
            <div style={{fontSize:20,fontWeight:800}}>AED {Number(total).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <button className="btn" style={{position:'fixed',right:18,bottom:18,borderRadius:999}} onClick={() => navigate('/')}>Continue shopping</button>
    </div>
  );
};

export default OrderPlaced;
