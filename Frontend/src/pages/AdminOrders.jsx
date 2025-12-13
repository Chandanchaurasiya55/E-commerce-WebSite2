import React, { useEffect, useState } from 'react';
import '../Style/AdminDashboard.css';
import '../Style/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // layout is fixed to card-only view now
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const API = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/order/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setOrders(data.orders || []);
      } catch (err) {
        console.error('fetch admin orders', err);
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    setStatusLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin login required');
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/order/admin/order/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update order');

      // update in UI
      setOrders(prev => prev.map(x => String(x._id) === String(id) ? data.order || { ...x, status: newStatus } : x));
      setSelected(prev => (prev && String(prev._id) === String(id) ? (data.order || { ...prev, status: newStatus }) : prev));
    } catch (err) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // derive small stats for header
  const totals = orders.reduce((acc, o) => {
    const s = String(o.status || 'placed').toLowerCase();
    acc.total += 1;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { total: 0 });

  return (
    <>
      <div className="orders-page">
        <header className="orders-header">
          <div>
            <h1>Orders</h1>
            <p className="sub">A modern, colorful view of all placed orders</p>
          </div>
          <div className="actions">
            <div className="total-stat">{orders.length} orders</div>
          </div>
        </header>

        {/* compact stats row */}
        <div className="orders-stats">
          <div className="stat-card stat-total">
            <div className="s-title">Total orders</div>
            <div className="s-value">{totals.total}</div>
          </div>
          <div className="stat-card stat-placed">
            <div className="s-title">Placed</div>
            <div className="s-value">{totals.placed || 0}</div>
          </div>
          <div className="stat-card stat-shipped">
            <div className="s-title">Shipped</div>
            <div className="s-value">{totals.shipped || 0}</div>
          </div>
          <div className="stat-card stat-delivered">
            <div className="s-title">Delivered</div>
            <div className="s-value">{totals.delivered || 0}</div>
          </div>
          <div className="stat-card stat-cancelled">
            <div className="s-title">Cancelled</div>
            <div className="s-value">{totals.cancelled || 0}</div>
          </div>
        </div>

        {loading ? (
          <div className="orders-empty">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">No orders yet</div>
        ) : (
            <div className="orders-list compact-row" style={{ alignItems: 'center', justifyContent: 'center' }}>
              {orders.map((o) => (
                <article className={`order-card minimal ${String(o.status || '').toLowerCase()}`} key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', minWidth: 320 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" title={o.user?.Fullname || o.user?.Email || 'Customer'} style={{ width: 44, height: 44, borderRadius: 8, fontWeight: 800, fontSize: 16 }}>
                      {(o.user?.Fullname || o.user?.Email || 'U').toString().split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <div className="order-meta">
                      <div className="user-name">{o.user?.Fullname || o.user?.Email || 'Unknown'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn-view" onClick={() => { setSelected(o); setModalOpen(true); }} aria-label="View order details">View</button>
                  </div>
                </article>
              ))}
            </div>
        )}
      </div>

      {/* details modal */}
      {modalOpen && selected && (
        <div className="order-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="om-header">
              <div className="om-left">
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div className="order-id">#{String(selected._id).slice(-8)}</div>
                  <button className="copy-id" onClick={() => { navigator?.clipboard?.writeText?.(String(selected._id)); alert('Order ID copied') }} title="Copy ID">Copy ID</button>
                </div>
                <div className="order-date">{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <div className="om-actions">
                <select value={selected.status || 'placed'} onChange={(e) => setSelected({ ...selected, status: e.target.value })}>
                  <option value="placed">Placed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="btn primary" onClick={() => updateStatus(selected._id, selected.status)} disabled={statusLoading}>{statusLoading ? 'Saving...' : 'Save'}</button>
                <button className="btn-ghost" onClick={() => setModalOpen(false)}>Close</button>
              </div>
            </div>

            <div className="om-body">
              <div className="om-col">
                <div className="panel">
                  <div className="panel-title">Items</div>
                      {selected.items?.map(it => (
                        <div key={String(it.product)} className="om-item-row">
                          <div className="om-item-thumb"><img src={it.img || it.image || '/placeholder.png'} alt={it.title} /></div>
                          <div className="om-item-body">
                            <div className="om-item-title">{it.title}</div>
                            <div className="om-item-sub">{it.quantity} × ${parseFloat(String(it.price).replace(/[^0-9.-]+/g,''))?.toFixed?.(2)}</div>
                          </div>
                          <div className="om-item-total">${(parseFloat(String(it.price).replace(/[^0-9.-]+/g,'')) * (it.quantity || 1)).toFixed(2)}</div>
                        </div>
                      ))}
                  </div>

                <div className="panel" style={{marginTop:12}}>
                  <div className="panel-title">Shipping</div>
                  {selected.shippingAddress ? (
                    <div style={{marginTop:8}}>
                      <div>{selected.shippingAddress.name}</div>
                      <div>{selected.shippingAddress.street}</div>
                      <div>{[selected.shippingAddress.city, selected.shippingAddress.state].filter(Boolean).join(', ')} {selected.shippingAddress.postalCode || ''}</div>
                      <div>{selected.shippingAddress.country}</div>
                      {selected.shippingAddress.phone && <div>📞 {selected.shippingAddress.phone}</div>}
                    </div>
                  ) : <div className="muted">No shipping info</div>}
                </div>
              </div>

              <div className="om-col">
                <div className="panel">
                  <div className="panel-title">Order Summary</div>
                  <div style={{marginTop:8,fontSize:16,fontWeight:800}}>${selected.totalAmount?.toFixed?.(2) ?? selected.totalAmount}</div>
                  <div style={{marginTop:10}}><strong>Payment:</strong> {selected.paymentMethod}</div>
                  <div style={{marginTop:10}}><strong>By:</strong> {selected.user?.Fullname || selected.user?.Email || 'Unknown'}</div>
                </div>

                <div className="panel" style={{marginTop:12}}>
                  <div className="panel-title">Activity</div>
                  <div style={{marginTop:8,fontSize:13,color:'#6b7280'}}>Created at: {new Date(selected.createdAt).toLocaleString()}</div>
                  <div style={{marginTop:6,fontSize:13,color:'#6b7280'}}>Order ID: {String(selected._id)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminOrders;
