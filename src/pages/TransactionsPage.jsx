import React, { useEffect, useState } from "react";
import api from "../api";
import { getMovementCounterparty, getMovementNoteBody } from "../utils/movementUtils";

// Tarih formatlama
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Resim URL'sini düzeltme
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return imageUrl;
};

const formatSentence = (movement) => {
  if (!movement) return "";
  const qty = Math.abs(movement.quantity || 0);
  const productName = movement.product?.name || "ürün";
  const verb =
    movement.type === "SATIS"
      ? "satıldı"
      : movement.type === "SATIN_ALMA"
      ? "teslim alındı"
      : "işlendi";
  const target = getMovementCounterparty(movement);
  return `${target} için ${qty} adet ${productName} ${verb}.`;
};

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await api.get("/reports/movements");
        setMovements(res.data);
      } catch (err) {
        console.error("Hareketler yüklenirken hata:", err);
        setError("Hareket verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Yükleniyor...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Raporlar</p>
          <h1>Son Hareketler</h1>
          <p className="muted">Son 1 haftada gerçekleşen tüm stok giriş ve çıkış işlemleri.</p>
        </div>
      </section>

      <section className="page-card product-table-card">
        <div className="table-wrap elevated">
          <table className="products-table">
            <thead>
              <tr>
                <th>Tarih & Saat</th>
                <th>Ürün</th>
                <th>İşlem Türü</th>
                <th className="text-right">Miktar</th>
                <th>Karşı Taraf & Not</th>
                <th className="text-right">Durum</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Son 7 günde hiç hareket kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td className="text-sm text-gray-600 font-medium">
                      {formatDate(m.createdAt)}
                    </td>
                    <td>
                      <div className="product-cell">
                         <div className="product-thumb">
                            {getImageUrl(m.product?.imageUrl) ? (
                                <img 
                                    src={getImageUrl(m.product.imageUrl)} 
                                    alt={m.product?.name} 
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="product-thumb-fallback">
                                    {m.product?.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                            )}
                         </div>
                         <span className="product-name">{m.product?.name || "Silinmiş Ürün"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        m.type === 'SATIS' ? 'bg-red-100 text-red-700' : 
                        m.type === 'SATIN_ALMA' ? 'bg-green-100 text-green-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {m.type === 'SATIS' ? 'SATIŞ / ÇIKIŞ' : 
                         m.type === 'SATIN_ALMA' ? 'SATIN ALMA / GİRİŞ' : m.type}
                      </span>
                    </td>
                    <td className={`td-right font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="movement-desc">
                      <div className="movement-counterparty">
                        {getMovementCounterparty(m)}
                      </div>
                      <div className="movement-text">{formatSentence(m)}</div>
                      {getMovementNoteBody(m.note) && (
                        <div className="movement-note-text">{getMovementNoteBody(m.note)}</div>
                      )}
                    </td>
                    <td className="td-right">
                        {m.quantity > 0 ? (
                            <span className="text-green-500">▲ Artış</span>
                        ) : (
                            <span className="text-red-500">▼ Azalış</span>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}