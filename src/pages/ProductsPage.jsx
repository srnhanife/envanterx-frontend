// src/pages/ProductsPage.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api";

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith("/api/")) return imagePath;
  const filename = imagePath.split("/").pop();
  return filename ? `/api/files/products/${encodeURIComponent(filename)}` : null;
};

const formatErrorMessage = (payload, fallback = "Bir hata oluştu.") => {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload.message === "string") return payload.message;
  try {
    return JSON.stringify(payload);
  } catch (err) {
    console.warn("formatErrorMessage stringify failed", err);
    return fallback;
  }
};

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const fileInputRef = useRef(null);

  // modal states
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    unitCost: "",
    stockQuantity: "",
    alertThreshold: "",
    description: "",
    imageFile: null,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const [stockModal, setStockModal] = useState({ open: false, product: null, type: "increase", amount: 0, note: "" });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setItems(res.data || []);
    } catch (e) {
      console.error("Products error:", e?.response || e);
      const msg = formatErrorMessage(
        e?.response?.data,
        e?.message || "Sunucuya bağlanılamadı veya yetki yok."
      );
      setErr(msg);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_basic");
    if (!token) return;
    fetchProducts();
  }, []);

  const filtered = items.filter((p) => {
    if (!q) return true;
    return (p.name || "").toLowerCase().includes(q.toLowerCase());
  });

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setAddForm((prev) => ({ ...prev, imageFile: file }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // assume backend POST /products
    try {
      setAddError("");
      setAddLoading(true);
      const formData = new FormData();
      formData.append("name", addForm.name);
      formData.append("unitCost", Number(addForm.unitCost) || 0);
      formData.append("stockQuantity", Number(addForm.stockQuantity) || 0);
      formData.append("alertThreshold", Number(addForm.alertThreshold) || 0);
      if (addForm.description) formData.append("description", addForm.description);
      if (addForm.imageFile) formData.append("image", addForm.imageFile);

      const auth = localStorage.getItem("auth_basic");
      const headers = {};
      if (auth) {
        const hasPrefix = /^Bearer |^Basic /i.test(auth);
        headers.Authorization = hasPrefix ? auth : `Bearer ${auth}`;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
        headers,
      });

      if (!res.ok) {
        let message = await res.text();
        try {
          const parsed = JSON.parse(message);
          message = formatErrorMessage(parsed, message);
        } catch (_) {
          message = message || "Ürün oluşturulamadı. Backend endpoint'i kontrol edin.";
        }
        throw new Error(message);
      }
      setShowAdd(false);
      setAddForm({ name: "", unitCost: "", stockQuantity: "", alertThreshold: "", description: "", imageFile: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setAddLoading(false);
      fetchProducts();
    } catch (e) {
      console.error("Add product error", e?.response || e);
      const message = e?.message || "Ürün oluşturulamadı. Backend endpoint'i kontrol edin.";
      setAddError(message);
      setAddLoading(false);
    }
  };

  const openStockModal = (product, type) => {
    setStockModal({ open: true, product, type, amount: 0, note: "" });
  };

  const submitStockChange = async (e) => {
    e.preventDefault();
    const { product, type, amount, note } = stockModal;
    if (!product) return;
    // Assumption: backend accepts POST /products/:id/stock with { amount, type, note }
    try {
      await api.post(`/products/${product.id}/stock`, { amount: Number(amount), type, note });
      setStockModal({ open: false, product: null, type: "increase", amount: 0, note: "" });
      fetchProducts();
    } catch (e) {
      console.error("Stock change error", e?.response || e);
      const status = e?.response?.status;
      const backendMsg = formatErrorMessage(
        e?.response?.data,
        e?.message || "Stok işlemi başarısız. Backend endpoint'i kontrol edin (ör: POST /products/:id/stock)."
      );

      // If 404, try a few reasonable fallbacks automatically to handle different backend implementations
      if (status === 404) {
        try {
          // Try PUT to same path
          await api.put(`/products/${product.id}/stock`, { amount: Number(amount), type, note });
          setStockModal({ open: false, product: null, type: "increase", amount: 0, note: "" });
          fetchProducts();
          return;
        } catch (e2) {
          console.warn("PUT fallback failed", e2?.response || e2);
        }

        try {
          // Try patching product directly with new stock value (some APIs expect update on product resource)
          const newQty = (Number(product.stockQuantity) || 0) + (type === 'increase' ? Number(amount) : -Number(amount));
          await api.patch(`/products/${product.id}`, { stockQuantity: newQty });
          setStockModal({ open: false, product: null, type: "increase", amount: 0, note: "" });
          fetchProducts();
          return;
        } catch (e3) {
          console.warn("PATCH fallback failed", e3?.response || e3);
        }
      }

      alert(`Hata ${status || ''}: ${backendMsg}`);
    }
  };

  if (err) {
    return <div className="page-container error-state">{err}</div>;
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Stoklar</p>
          <h1>Ürünler</h1>
          <p className="muted">Genel görünüm · güncel envanter ve değerleri</p>
        </div>
        <div className="hero-actions">
          <button onClick={() => setShowAdd(true)} className="btn-primary lg">
            + Yeni Ürün
          </button>
        </div>
      </section>

      <section className="page-card product-table-card">
        <div className="products-toolbar">
          <input
            placeholder="Ara..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="form-control"
          />
          <div className="toolbar-gap" />
          <button onClick={() => setShowAdd(true)} className="btn ghost">
            Ürün Ekle
          </button>
        </div>

        <div className="table-wrap elevated">
          <table className="products-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Stok</th>
                <th>Birim</th>
                <th>Eşik</th>
                <th>Değer</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="td-name">
                    <div className="product-cell">
                      <div className="product-thumb">
                        {buildImageUrl(p.imagePath) ? (
                          <img src={buildImageUrl(p.imagePath)} alt={p.name || "Ürün görseli"} />
                        ) : (
                          <div className="product-thumb-fallback">{(p.name || "?").slice(0, 1).toUpperCase()}</div>
                        )}
                      </div>
                      <div>
                        <div className="product-name">{p.name}</div>
                        {p.description && <div className="product-desc">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="td-right">
                    <span className="metric-chip">{p.stockQuantity}</span>
                  </td>
                  <td className="td-right">{p.unitCost}</td>
                  <td className="td-right">{p.alertThreshold}</td>
                  <td className="td-right">
                    {(p.stockQuantity || 0) * (p.unitCost || 0)}
                  </td>
                  <td className="td-actions">
                    <button onClick={() => openStockModal(p, "increase")} className="btn">+ Stok</button>
                    <button onClick={() => openStockModal(p, "decrease")} className="btn btn-ghost">- Stok</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Hiç ürün bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add product modal (simple) */}
      {showAdd && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Yeni Ürün Ekle</h3>
                <p className="modal-subtitle">Yeni bir ürün oluşturmak için alanları doldurun.</p>
              </div>
              <div>
                <button onClick={() => setShowAdd(false)} className="btn-close">Kapat ✕</button>
              </div>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-form">
              {addError && <div className="alert-error">{addError}</div>}
              <div className="grid-two">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium">Ürün Adı</label>
                  <input required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="form-control" placeholder="Örn. Vida M4" />
                </div>

                <div>
                  <label className="block text-sm font-medium">Birim Maliyet</label>
                  <input inputMode="decimal" value={addForm.unitCost} onChange={e => setAddForm({...addForm, unitCost: e.target.value})} className="form-control" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Stok Miktarı</label>
                  <input type="number" min="0" value={addForm.stockQuantity} onChange={e => setAddForm({...addForm, stockQuantity: e.target.value})} className="form-control" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Eşik</label>
                  <input type="number" min="0" value={addForm.alertThreshold} onChange={e => setAddForm({...addForm, alertThreshold: e.target.value})} className="form-control" placeholder="0" />
                </div>
                <div className="full-col">
                  <label className="block text-sm font-medium">Açıklama (opsiyonel)</label>
                  <textarea value={addForm.description || ''} onChange={e => setAddForm({...addForm, description: e.target.value})} className="form-control" placeholder="Opsiyonel açıklama..." rows={3}></textarea>
                </div>
                <div className="full-col">
                  <label className="block text-sm font-medium">Ürün Görseli</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="form-control"
                  />
                  <small className="input-hint">JPG/PNG, maks 10MB</small>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAdd(false)} className="btn">İptal</button>
                <button type="submit" disabled={addLoading} className="btn-primary">
                  {addLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock modal */}
      {stockModal.open && stockModal.product && (
        <div className="modal-backdrop">
          <form onSubmit={submitStockChange} className="modal-card modal-card-sm">
            <h3 className="modal-title">{stockModal.type === 'increase' ? "Stok Ekle" : "Stok Çıkar"} - {stockModal.product.name}</h3>
            <div className="mt-4">
              <label className="block text-sm">Miktar</label>
              <input required type="number" value={stockModal.amount} onChange={e => setStockModal({...stockModal, amount: e.target.value})} className="form-control" />
            </div>
            <div className="mt-3">
              <label className="block text-sm">Açıklama (opsiyonel)</label>
              <input value={stockModal.note} onChange={e => setStockModal({...stockModal, note: e.target.value})} className="form-control" />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setStockModal({ open: false, product: null, type: 'increase', amount: 0, note: '' })} className="btn">İptal</button>
              <button type="submit" className="btn-primary">Kaydet</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
