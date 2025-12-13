import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Please log in to view your orders.');
          setLoading(false);
          return;
        }

        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/api/order/my`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 401) {
            setError('You are not logged in — please sign in to continue.');
            setLoading(false);
            return;
          }
          throw new Error(data.message || 'Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('fetch user orders', err);
        setError(err?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="orders-page"><div className="orders-empty">Loading your orders…</div></div>;

  if (error) return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Your Orders</h1>
        <p className="sub">Order history and details</p>
      </div>
      <div className="orders-empty">{error} {error.includes('log in') && (
        <button className="btn primary" style={{marginLeft:12}} onClick={() => navigate('/auth', { state: { redirectTo: '/orders' } })}>Sign in</button>
      )}</div>
    </div>
  );

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div>
          <h1>Your Orders</h1>
          <p className="sub">A clear, modern view of everything you've ordered</p>
        </div>
        <div className="actions">
          <div className="total-stat">{orders.length} orders</div>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="orders-empty">You haven't placed any orders yet</div>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <article key={o._id} className="order-card">
              <div className="oc-top">
                <div className="oc-left">
                  <div className="order-id">#{String(o._id).slice(-8)}</div>
                  <div className="order-date">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="oc-right">
                    <div className={`status-pill ${String(o.status || '').toLowerCase()}`}>{String(o.status || 'pending').charAt(0).toUpperCase() + String(o.status || 'pending').slice(1)}</div>
                  <div className="order-total">${o.totalAmount?.toFixed?.(2) ?? o.totalAmount}</div>
                </div>
              </div>

              <div className="oc-body">
                <div className="items-list-mini">
                  {(o.items || []).slice(0, 4).map((it) => (
                    <div key={String(it.product)} className="mini-item">
                      <div className="thumb"><img src={it.img || '/placeholder.png'} alt={it.title || it.product} /></div>
                      <div className="meta">
                        <div className="title">{it.title || 'Untitled'}</div>
                        <div className="qty">{it.quantity} × ${parseFloat(String(it.price).replace(/[^0-9.-]+/g, ''))?.toFixed?.(2)}</div>
                      </div>
                    </div>
                  ))}
                  {o.items && o.items.length > 4 && <div className="more">+{o.items.length - 4} more</div>}
                </div>

                <div className="shipping-info panel">
                  <div className="label">Ship to</div>
                  {o.shippingAddress ? (
                    <div className="addr">
                      <div>{o.shippingAddress.name}</div>
                      <div>{o.shippingAddress.street}</div>
                      <div>{[o.shippingAddress.city, o.shippingAddress.state].filter(Boolean).join(', ')} {o.shippingAddress.postalCode || ''}</div>
                      <div>{o.shippingAddress.country}</div>
                    </div>
                  ) : <div className="muted">No shipping info</div>}
                </div>

                <div className="payment-info panel">
                  <div className="label">Payment</div>
                  <div>{o.paymentMethod || '—'}</div>
                </div>
              </div>

              <footer className="oc-footer">
                <button className="btn-sm" onClick={() => navigate(`/orders/${o._id}`)}>View details</button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    // quick contact or re-order action could be implemented later
                    alert('Coming soon: open order in detail page');
                  }}
                >
                  Actions
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
