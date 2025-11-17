import React, { useEffect, useState } from "react";
import api from "../api";

export default function TransactionsPage() {
  const [movements, setMovements] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Assumption: backend exposes /products/movements or /transactions. Try /transactions then fallback.
        let res;
        try {
          res = await api.get("/transactions");
        } catch (e) {
          res = await api.get("/products/movements");
        }
        setMovements(res.data || []);
      } catch (e) {
        console.error(e);
        setErr("Hareketler yüklenemedi.");
      }
    })();
  }, []);

  if (err) return <div style={{ color: "#b91c1c", padding: 16 }}>{err}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Hareketler / Stok Hareketleri</h2>
      <div style={{ overflowX: "auto" }}>
        <table className="min-w-full border" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Tarih</th>
              <th style={{ textAlign: "left", padding: 8 }}>Ürün</th>
              <th style={{ textAlign: "right", padding: 8 }}>Miktar</th>
              <th style={{ textAlign: "left", padding: 8 }}>Tür</th>
              <th style={{ textAlign: "left", padding: 8 }}>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id || `${m.productId}-${m.date}` }>
                <td style={{ padding: 8 }}>{new Date(m.date || m.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{m.productName || m.name || m.product?.name}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{m.change || m.quantity || m.amount}</td>
                <td style={{ padding: 8 }}>{m.type || (m.change > 0 ? "Giriş" : "Çıkış")}</td>
                <td style={{ padding: 8 }}>{m.note || m.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
