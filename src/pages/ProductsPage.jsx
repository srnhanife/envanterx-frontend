// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_basic");
    if (!token) return; // Route guard zaten var ama yine de kontrol
    (async () => {
      try {
        const res = await api.get("/products");
        setItems(res.data || []);
      } catch (e) {
        console.error("Products error:", e?.response || e);
        setErr("Sunucuya bağlanılamadı veya yetki yok.");
      }
    })();
  }, []);

  if (err) return <div style={{ color: "#b91c1c", padding: 16 }}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Ürünler</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Ad</th><th>Stok</th><th>Birim Maliyet</th><th>Eşik</th><th>Toplam Değer</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.stockQuantity}</td>
              <td>{p.unitCost}</td>
              <td>{p.alertThreshold}</td>
              <td>{(p.stockQuantity || 0) * (p.unitCost || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
