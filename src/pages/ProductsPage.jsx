// src/pages/ProductsPage.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import axios from "axios"; // Axios'u ekledik (Eğer api.js axios kullanıyorsa, sadece api importu yeterli olabilir)


const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // Eğer tam bir URL ise (http:// veya https://) olduğu gibi kullan
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  
  return imageUrl;
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
      const res = await api.get("/products"); // Spring Boot endpoint: /api/products
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

  // YENİ: İki Aşamalı Kaydetme Mantığı (Modal İçin)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    
    let finalImageUrl = "";

    try {
      
      if (addForm.imageFile) {
        const formData = new FormData();
        formData.append("image", addForm.imageFile);

        // NOT: Eğer api instance'ınızda baseURL varsa, '/storage/upload' yeterli.
        // Yoksa tam URL yazın. api.js'nize bağlı.
        const uploadRes = await api.post("/storage/upload", formData, {
           headers: { "Content-Type": "multipart/form-data" }
        });
        finalImageUrl = uploadRes.data; // Dönen URL
      }

      
      const productData = {
        name: addForm.name,
        unitCost: Number(addForm.unitCost) || 0,
        stockQuantity: Number(addForm.stockQuantity) || 0,
        alertThreshold: Number(addForm.alertThreshold) || 0,
        description: addForm.description,
        imageUrl: finalImageUrl // URL'yi ekle
      };

      await api.post("/products", productData);

      // Başarılı
      setShowAdd(false);
      setAddForm({ name: "", unitCost: "", stockQuantity: "", alertThreshold: "", description: "", imageFile: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setAddLoading(false);
      fetchProducts(); // Listeyi yenile

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
     // ... (Bu kısım değişmedi, Spring Boot için uygun görünüyor)
     // Eğer Spring Boot endpoint'iniz farklıysa burayı da güncellemeliyiz.
     // Şimdilik mevcut mantığınızı koruyorum.
     e.preventDefault();
     const { product, type, amount, note } = stockModal;
     if (!product) return;

    try {
       
       
       const endpoint = type === 'increase' ? '/stock/purchase' : '/stock/sell';
       const stockRequest = {
           productId: product.id,
           quantity: Number(amount)
       };

       await api.post(endpoint, stockRequest);
       
       setStockModal({ open: false, product: null, type: "increase", amount: 0, note: "" });
       fetchProducts();
     } catch (e) {
       // ... Hata yönetimi ...
       console.error("Stock change error", e);
       alert("Stok işlemi başarısız.");
     }
  };

  if (err) {
    return <div className="page-container error-state">{err}</div>;
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        {/* ... (Hero kısmı aynı) ... */}
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
            {/* ... (Toolbar kısmı aynı) ... */}
           <input placeholder="Ara..." value={q} onChange={e => setQ(e.target.value)} className="form-control" />
           <div className="toolbar-gap" />
           <button onClick={() => setShowAdd(true)} className="btn ghost">Ürün Ekle</button>
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
                      
                      {/* --- RESİM GÖSTERME ALANI --- */}
                      <div className="product-thumb">
                        {getImageUrl(p.imageUrl) ? (
                          // Resim URL'si varsa göster
                          <img 
                              src={getImageUrl(p.imageUrl)} 
                              alt={p.name || "Ürün görseli"} 
                              className="w-10 h-10 rounded-full object-cover" // Tailwind sınıfları
                          />
                        ) : (
                          // Yoksa Baş Harfi Göster
                          <div className="product-thumb-fallback">{(p.name || "?").slice(0, 1).toUpperCase()}</div>
                        )}
                      </div>
                      {/* ----------------------------- */}

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

      {/* Add Product Modal */}
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
                {/* ... Diğer inputlar (Birim, Stok, Eşik, Açıklama) aynı ... */}
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
                {/* Resim Input'u */}
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

      {/* Stock modal - Aynı kalabilir */}
       {stockModal.open && stockModal.product && (
        <div className="modal-backdrop">
           {/* ... Stok modal içeriği ... */}
             <form onSubmit={submitStockChange} className="modal-card modal-card-sm">
               {/* ... Form içeriği ... */}
                <h3 className="modal-title">{stockModal.type === 'increase' ? "Stok Ekle" : "Stok Çıkar"} - {stockModal.product.name}</h3>
                 <div className="mt-4">
                  <label className="block text-sm">Miktar</label>
                  <input required type="number" value={stockModal.amount} onChange={e => setStockModal({...stockModal, amount: e.target.value})} className="form-control" />
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