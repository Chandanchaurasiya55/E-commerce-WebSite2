import React, { useState, useRef } from 'react';
import '../Style/SellerUpload.css';
const API = import.meta.env.VITE_API_URL;

const SellerUpload = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [Vat, setVat] = useState('');
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic client-side validation
    if (!title?.trim()) return setStatus('Please enter product title');
    const normalizedPrice = String(price).replace(/[^0-9.]/g, '');
    if (!normalizedPrice) return setStatus('Please enter a valid price');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
            // seller key removed — uploading without x-seller-key header
        },
        // send images array (if present) — API accepts `images` or `img` (single)
        body: JSON.stringify({ title, price, images, description })
      });
      const data = await res.json();
      if (res.ok) {
        // success — use server message if available and reset form safely
        setStatus(data?.message || 'Product uploaded successfully');
        setTitle(''); setPrice(''); setImages([]); setFilePreview(''); setDescription('');
        if (fileRef.current) fileRef.current.value = null;
      } else {
        setStatus(data?.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('Server error');
    }
    setLoading(false);
  };

  const previewSrc = filePreview || (Array.isArray(images) && images[0]) || '/placeholder-product.svg';

  // handle a single File object for previewing (helpers)
  const handleFile = (file, addOnly = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
      if (!addOnly) return;
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Add up to 3 images total
    const allowed = files.slice(0, 3 - images.length);
    const readers = allowed.map(f => new Promise((resolve) => {
      const r = new FileReader();
      r.onload = (ev) => resolve(ev.target.result);
      r.readAsDataURL(f);
    }));

    Promise.all(readers).then(results => {
      setImages(prev => {
        const next = prev.concat(results).slice(0, 3);
        return next;
      });
      // set preview to the most recently added or first
      setFilePreview(results[0] || filePreview);
    });
  };

  const onDropFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) {
      // copy to file input so user can re-open if needed
      fileRef.current.files = e.dataTransfer.files;
      onFileChange({ target: fileRef.current });
    }
  };

  const clearForm = () => {
    setTitle(''); setPrice(''); setImages([]); setFilePreview(''); setStatus('');
    if (fileRef.current) fileRef.current.value = null;
  };

  return (
    <div className="seller-wrap">
      <div className="seller-header modern">
        <div>
          <h2 className="seller-title">Seller — Upload Product</h2>
          <div className="seller-sub">Public upload — sellers can upload products without a secret key.</div>
        </div>
        <div className="meta">🚀 Fast upload</div>
      </div>

      <div className="seller-grid modern-grid">
        <div className="upload-card form-card">
          <form onSubmit={handleSubmit} className="seller-form">
            {/* Seller Key removed — upload no longer requires a secret key */}

            <div className="form-row">
              <div className="field">
                <label>Product Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="E.g. Wireless Headphones" required aria-label="Product title" />
              </div>
              <div className="field">
                <label>Price</label>
                <div className="price-row">
                  <span className="currency">AED</span>
                  <input
                    inputMode="decimal"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 19.99"
                    required
                    aria-label="Price"
                  />
                </div>
              </div>

               <div className="field">
                <label>VAT</label>
                <div className="price-row">
                  <span className="currency">AED</span>
                  <input
                    inputMode="decimal"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 19.99"
                    required
                    aria-label="VAT"
                  />
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="field">
                <label>Image URL (or upload)</label>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <input value={images[0] || ''} onChange={e=>{
                    const v = e.target.value; setImages(prev => {
                      const next = [...prev]; next[0] = v; return next.filter(Boolean).slice(0,3);
                    });
                  }} placeholder="Image URL (optional) - first image shown as main" aria-label="Image URL" />
                  <small style={{color:'#6b7280'}}>You can add up to 3 images — use the file uploader to add more.</small>
                </div>
                <label style={{display:'block',marginTop:8,fontSize:13,color:'#334155'}}>Description (optional)</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description about this product" aria-label="Product description" rows={3} />
                <div className="file-area" onDrop={onDropFile} onDragOver={(e)=>e.preventDefault()}>
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFileChange} aria-label="Upload image file" />
                  <small>Or drag & drop an image here</small>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:10,marginTop:10}}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Upload Product'}</button>
              <button type="button" className="btn btn-ghost" onClick={clearForm}>Reset</button>
            </div>

            {status && (() => {
              const s = String(status || '').toLowerCase();
              const isSuccess = s.includes('success') || s.includes('uploaded') || s.includes('upload completed') || s.includes('complete') || s.includes('completed');
              const isError = !isSuccess && (s.includes('error') || s.includes('failed'));
              return <div className={`status ${isSuccess ? 'success' : isError ? 'error' : ''}`}>{status}</div>;
            })()}
          </form>
        </div>

        <aside className="preview-col">
          <div className="upload-card preview modern-preview">
            <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                <div style={{fontSize:12,color:'#64748b'}}>Live Preview</div>
                <div className="preview-title" style={{fontSize:16}}>{title || 'Product title (preview)'}</div>
                <div style={{color:'#475569',marginTop:6,fontSize:14}}>{description || 'Product description (preview)'}</div>
                <div className="preview-price">{price ? `$${String(price).replace(/[^0-9.]/g,'')}` : '$–'}</div>
              </div>
            </div>

            <div className="product-thumb modern-thumb" style={{display:'flex',flexDirection:'column',gap:8}}>
              {previewSrc ? <img src={previewSrc} alt="preview" onError={(e)=>{e.target.onerror=null;e.target.src='/placeholder-product.png'}} /> : (
                <div style={{padding:18,textAlign:'center',color:'#94a3b8'}}>No image — place a valid image URL or upload a picture</div>
              )}

              {/* thumbnails for multiple images */}
              {images && images.length > 0 && (
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  {images.map((it, idx) => (
                    <div key={idx} style={{position:'relative'}}>
                      <img src={it} alt={`preview-${idx}`} style={{width:72,height:72,objectFit:'cover',borderRadius:6}} onClick={()=>setFilePreview(it)} />
                      <button type="button" onClick={()=>{
                        setImages(prev => prev.filter((_,i)=>i!==idx));
                        if (filePreview === it) setFilePreview((prevArr => ((images[0] && images[0] !== it) ? images[0] : '')));
                      }} className="btn-sm" style={{position:'absolute',right:-8,top:-8}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="preview-note">Once uploaded the item will appear in your product list so customers can buy it. Tip: Use a clear product image for better conversion.</div>
            <div className="meta smallish" style={{marginTop:8}}>Preview updates live — image, title and price.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SellerUpload;
