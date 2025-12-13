import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Style/AdminDashboard.css';
// reuse admin orders styles for compact cards + modal
import '../Style/AdminOrders.css';

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const adminName = localStorage.getItem('adminName');
    setAdminName(adminName || 'Admin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    window.dispatchEvent(new Event('adminLoggedOut'));
    navigate('/');
  };

  // sample placeholder stats (in future we can fetch real data)
  const stats = [
    { id: 1, label: 'Products', value: 124, icon: '📦', color: 'linear-gradient(120deg,#7c3aed,#06b6d4)' },
    { id: 2, label: 'Orders', value: 48, icon: '🧾', color: 'linear-gradient(120deg,#06b6d4,#7c3aed)' },
    { id: 3, label: 'Revenue', value: '$24.6k', icon: '💰', color: 'linear-gradient(120deg,#f97316,#ef4444)' },
    { id: 4, label: 'Users', value: 3_412, icon: '👥', color: 'linear-gradient(120deg,#10b981,#06b6d4)' }
  ];

  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});

  const updateStatus = async (id, newStatus) => {
    try {
      setStatusLoadingId(id);
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

      // update local lists
      setOrders(prev => prev.map(x => String(x._id) === String(id) ? (data.order || { ...x, status: newStatus }) : x));
      setProductOrders(prev => prev.map(x => String(x._id) === String(id) ? (data.order || { ...x, status: newStatus }) : x));
      if (selectedOrder && String(selectedOrder._id) === String(id)) {
        setSelectedOrder(data.order || { ...selectedOrder, status: newStatus });
      }

      return true;
    } catch (err) {
      alert(err?.message || 'Failed to update status');
      return false;
    } finally {
      setStatusLoadingId(null);
    }
  };
  const [productOrders, setProductOrders] = useState([]);
  const [productOrdersLoading, setProductOrdersLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [systemStatus, setSystemStatus] = useState({ dbConnected: false, paymentConfigured: false, emailConfigured: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch recent ordered products for admin
  useEffect(() => {
    const fetchRecent = async () => {
      const API = import.meta.env.VITE_API_URL;
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return; // not admin

      try {
        setLoadingRecent(true);
        const res = await fetch(`${API}/api/order/admin/recent-orders`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await res.json();
          if (res.ok) {
          // unique by productId - keep most recent
          const seen = new Set();
          const unique = [];
          for (const it of data.items || []) {
            const pid = String(it.productId);
            if (!seen.has(pid)) {
              seen.add(pid);
              // include shippingAddress if present on the recent-orders item
              unique.push({
                id: pid,
                title: it.title,
                price: it.price,
                img: it.img,
                orderedAt: it.orderedAt,
                orderedBy: it.orderedBy,
                shippingAddress: it.shippingAddress || null,
              });
            }
            if (unique.length >= 5) break;
          }
          setRecentProducts(unique);
        } else {
          console.error('Failed loading recent orders', data);
        }
      } catch (err) {
        console.error('Error fetching recent orders', err);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecent();

    // fetch recent/ongoing orders for quick admin access
    const fetchOrders = async () => {
      const API = import.meta.env.VITE_API_URL;
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      try {
        setOrdersLoading(true);
        const res = await fetch(`${API}/api/order/admin/orders`, { headers: { Authorization: `Bearer ${adminToken}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return console.error('Failed loading admin orders', data);

        // show only ongoing orders (placed/shipped) and keep most recent 6
        const ongoing = (data.orders || []).filter(o => !['delivered', 'cancelled'].includes(String(o.status || '').toLowerCase()));
        setOrders(ongoing.slice(0, 6));
      } catch (err) {
        console.error('Admin dashboard: fetch orders failed', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();

    // fetch system status
    const fetchStatus = async () => {
      const API = import.meta.env.VITE_API_URL;
      try {
        const res = await fetch(`${API}/api/status`);
        const data = await res.json();
        if (res.ok) setSystemStatus({ dbConnected: !!data.dbConnected, paymentConfigured: !!data.paymentConfigured, emailConfigured: !!data.emailConfigured });
      } catch (err) {
        console.error('failed to read system status', err);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">E‑Store Admin</div>
          <nav className="side-nav">
          <button className="nav-item active">Admin</button>
          <button className="nav-item" onClick={() => navigate('/seller')}>Upload Product</button>
          <button className="nav-item" onClick={() => navigate('/admin-products')}>Products</button>
          <button className="nav-item" onClick={() => navigate('/admin-orders')}>Orders</button>
        </nav>
        <div className="sidebar-footer">Logged in as <strong>{adminName || 'Admin'}</strong></div>
      </aside>
      {sidebarOpen && <div className="mobile-overlay" onClick={()=>setSidebarOpen(false)} aria-hidden="true"></div>}

      <main className="admin-main">
        <header className="admin-header">
          {/* mobile toggle */}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)} aria-expanded={sidebarOpen} aria-label="Toggle sidebar">
            ☰
          </button>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <div className="page-sub">Welcome back, <strong>{adminName}</strong></div>
          </div>

          <div className="header-actions">
            <div className="search">
              <input placeholder="Search products, orders or users" />
            </div>
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            {/* small-screen close button inside main area */}
            {sidebarOpen ? <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button> : null}
          </div>
        </header>

        <section className="card split" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="card-col">
            <h3 className="card-title">Recent Products</h3>
            {loadingRecent ? (
              <div>Loading recent orders…</div>
            ) : recentProducts.length === 0 ? (
              <div style={{color:'#64748b'}}>No recent ordered products yet — they will appear here after customers place orders.</div>
            ) : (
              <ul className="recent-list">
                {recentProducts.map(p => (
                  <li key={p.id} className="recent-item">
                    <img src={p.img || '/placeholder-product.png'} alt={p.title} />
                    <div className="meta">
                      <div className="title">{p.title}</div>
                      <div className="sub">{p.id} • {p.price}</div>
                      {p.shippingAddress ? (
                        <div className="address smallish" title={p.shippingAddress && JSON.stringify(p.shippingAddress)}>
                          Shipping: {p.shippingAddress.name || p.shippingAddress.street || ''}{p.shippingAddress.city ? `, ${p.shippingAddress.city}` : ''}{p.shippingAddress.country ? ` • ${p.shippingAddress.country}` : ''}
                        </div>
                      ) : null}
                    </div>
                          <div className="actions">
                            <button className="btn-sm" onClick={() => navigate(`/admin-orders?highlight=${p.id}`)}>Edit</button>
                      <button
                        className="btn-sm btn-danger"
                        onClick={async () => {
                          if (!confirm('Are you sure you want to DELETE this product? This action cannot be undone.')) return;
                          const adminToken = localStorage.getItem('adminToken');
                          if (!adminToken) return alert('Admin login required to delete products');
                          try {
                            const API = import.meta.env.VITE_API_URL;
                            const res = await fetch(`${API}/api/admin/product/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
                            const data = await res.json();
                            if (!res.ok) return alert(data.message || 'Failed to delete product');
                            // remove from the displayed list
                            setRecentProducts(prev => prev.filter(x => x.id !== p.id));
                          } catch (err) {
                            console.error('delete product failed', err);
                            alert('Failed to delete product — try again');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-col">
            <h3 className="card-title">Quick Access</h3>
            <div className="quick-grid">
              <button className="action" onClick={() => navigate('/seller')}>➕ Upload</button>
              <button className="action" onClick={() => navigate('/admin-products')}>📦 Products</button>
              <button className="action" onClick={() => navigate('/admin-orders')}>📝 Orders</button>
              <button className="action" onClick={() => {
                // Export visible recent products to CSV
                if (!recentProducts || recentProducts.length === 0) return alert('No recent products to export');
                const rows = recentProducts.map(p => ({ id: p.id, title: p.title, price: p.price }));
                const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `recent-products-${Date.now()}.csv`;
                document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
              }}>📤 Export CSV</button>
              <button className="action" onClick={() => alert('Settings screen — coming soon')}>⚙️ Settings</button>
            </div>

            <div style={{ marginTop: 18 }}>
              <h4 className="smallish">System status</h4>
              <div className="status-pills">
                <span className={`pill ${systemStatus.dbConnected ? 'green' : ''}`}>{systemStatus.dbConnected ? 'DB connected' : 'DB disconnected'}</span>
                <span className={`pill ${systemStatus.paymentConfigured ? 'green' : ''}`}>{systemStatus.paymentConfigured ? 'Payment online' : 'Payment disabled'}</span>
                <span className={`pill ${systemStatus.emailConfigured ? 'green' : ''}`}>{systemStatus.emailConfigured ? 'Email service' : 'Email disabled'}</span>
              </div>
            </div>
          </div>
        </section>

       {/* Product-specific orders (shown after clicking 'View Orders' on a product) */}
        {selectedProduct ? (
          <section className="card" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h3 className="card-title">Orders for "{selectedProduct.title || selectedProduct.id}"</h3>
            {productOrdersLoading ? (
              <div>Loading orders…</div>
            ) : productOrders.length === 0 ? (
              <div style={{ color: '#64748b' }}>No orders found for this product.</div>
            ) : (
              <div className="orders-row" style={{ padding:'8px 0' }}>
                {productOrders.map(o => (
                  <article key={o._id} className={`order-card compact ${String(o.status || '').toLowerCase()}`} style={{ display:'flex', flexDirection:'column' }}>
                    <section className="card-header">
                      <div className="header-left">
                        <div className="avatar" title={o.user?.Fullname || o.user?.Email || 'Customer'}>
                          {(o.user?.Fullname || o.user?.Email || 'U').toString().split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                        <div className="order-id">#{String(o._id).slice(-8)}</div>
                        <div className="order-meta">
                          <div className="user-name">{o.user?.Fullname || o.user?.Email || 'Unknown'}</div>
                          <div className="user-email smallish">{o.user?.Email}</div>
                        </div>
                      </div>
                    </section>
                    <div style={{ padding: 12 }}>
                      <div style={{marginBottom:8}}>Total: <strong>${o.totalAmount?.toFixed?.(2) ?? o.totalAmount}</strong></div>
                      <div style={{display:'flex',gap:8,justifyContent:'flex-end',alignItems:'center'}}>
                        <select
                          value={orderStatusDrafts[o._id] ?? (o.status || 'placed')}
                          onChange={(e) => setOrderStatusDrafts(prev => ({ ...prev, [o._id]: e.target.value }))}
                          style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)' }}
                        >
                          <option value="placed">Placed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="btn" onClick={async () => {
                          const newStatus = orderStatusDrafts[o._id] ?? (o.status || 'placed');
                          const ok = await updateStatus(o._id, newStatus);
                          if (ok) setOrderStatusDrafts(prev => { const copy = { ...prev }; delete copy[o._id]; return copy; });
                        }} disabled={statusLoadingId === o._id}>{statusLoadingId === o._id ? 'Saving...' : 'Save'}</button>
                        <button className="btn-view" onClick={() => { setSelectedOrder(o); setOrderModalOpen(true); }}>View</button>
                        <button className="btn-sm" onClick={() => { navigator?.clipboard?.writeText?.(String(o._id)); alert('Order id copied') }}>Copy</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div style={{marginTop:12,fontSize:13}}>
              <button className="btn-ghost" onClick={() => { setSelectedProduct(null); setProductOrders([]); }}>Close product orders</button>
            </div>
          </section>
        ) : null}

        {/* order details modal */}
        {orderModalOpen && selectedOrder && (
          <div className="order-modal-overlay" onClick={() => setOrderModalOpen(false)}>
            <div className="order-modal" onClick={e => e.stopPropagation()}>
              <div className="om-header">
                <div className="om-left">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div className="order-id">#{String(selectedOrder._id).slice(-8)}</div>
                    <button className="copy-id" onClick={() => { navigator?.clipboard?.writeText?.(String(selectedOrder._id)); alert('Order ID copied') }} title="Copy ID">Copy ID</button>
                  </div>
                  <div className="order-date">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
                <div className="om-actions">
                  <select value={selectedOrder.status ?? 'placed'} onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}>
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="btn primary" onClick={() => updateStatus(selectedOrder._id, selectedOrder.status)} disabled={statusLoadingId === selectedOrder._id}>{statusLoadingId === selectedOrder._id ? 'Saving...' : 'Save'}</button>
                  <button className="btn-ghost" onClick={() => setOrderModalOpen(false)}>Close</button>
                </div>
              </div>

              <div className="om-body">
                <div className="om-col">
                  <div className="panel">
                    <div className="panel-title">Items</div>
                    {selectedOrder.items?.map(it => (
                      <div key={String(it.product)} className="om-item-row">
                        <div className="om-item-thumb"><img src={it.img || it.image || '/placeholder.png'} alt={it.title} /></div>
                        <div className="om-item-body">
                          <div className="om-item-title">{it.title}</div>
                          <div className="om-item-sub">{it.quantity} × AED{parseFloat(String(it.price).replace(/[^0-9.-]+/g,''))?.toFixed?.(2)}</div>
                        </div>
                        <div className="om-item-total">${(parseFloat(String(it.price).replace(/[^0-9.-]+/g,'')) * (it.quantity || 1)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="panel" style={{marginTop:12}}>
                    <div className="panel-title">Shipping</div>
                    {selectedOrder.shippingAddress ? (
                      <div style={{marginTop:8}}>
                        <div>{selectedOrder.shippingAddress.name}</div>
                        <div>{selectedOrder.shippingAddress.street}</div>
                        <div>{[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state].filter(Boolean).join(', ')} {selectedOrder.shippingAddress.postalCode || ''}</div>
                        <div>{selectedOrder.shippingAddress.country}</div>
                        {selectedOrder.shippingAddress.phone && <div>📞 {selectedOrder.shippingAddress.phone}</div>}
                      </div>
                    ) : <div className="muted">No shipping info</div>}
                  </div>
                </div>

                <div className="om-col">
                  <div className="panel">
                    <div className="panel-title">Order Summary</div>
                    <div style={{marginTop:8,fontSize:16,fontWeight:800}}>${selectedOrder.totalAmount?.toFixed?.(2) ?? selectedOrder.totalAmount}</div>
                    <div style={{marginTop:10}}><strong>Payment:</strong> {selectedOrder.paymentMethod}</div>
                    <div style={{marginTop:10}}><strong>By:</strong> {selectedOrder.user?.Fullname || selectedOrder.user?.Email || 'Unknown'}</div>
                  </div>

                  <div className="panel" style={{marginTop:12}}>
                    <div className="panel-title">Activity</div>
                    <div style={{marginTop:8,fontSize:13,color:'#6b7280'}}>Created at: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    <div style={{marginTop:6,fontSize:13,color:'#6b7280'}}>Order ID: {String(selectedOrder._id)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="admin-footer">© {new Date().getFullYear()} E‑Store • Admin panel</footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
