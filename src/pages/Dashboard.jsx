// Minimal, şık Dashboard – Tailwind ile
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Stat({ label, value, tone = "indigo" }) {
  const toneMap = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      <div className={`mt-3 inline-block rounded-full px-2 py-0.5 text-[11px] ${toneMap[tone]}`}>
        güncel
      </div>
    </div>
  );
}

function QuickActions() {
  const Btn = ({ to, children }) => (
    <Link
      to={to}
      className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
    >
      {children}
    </Link>
  );
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-900">Hızlı İşlemler</div>
      <div className="flex flex-wrap gap-2">
        <Btn to="/products/new">Ürün ekle</Btn>
        <Btn to="/movements?type=purchase">Satın alma</Btn>
        <Btn to="/movements?type=sale">Satış</Btn>
        <Btn to="/reports">Raporlar</Btn>
      </div>
    </div>
  );
}

function LowStock({ rows }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-900">Eşik altı stoklar</div>
      <div className="overflow-x-auto">
        <table className="min-w-[520px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-[13px] text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Ad</th>
              <th className="border-b border-slate-200 px-3 py-2">Stok</th>
              <th className="border-b border-slate-200 px-3 py-2">Eşik</th>
              <th className="border-b border-slate-200 px-3 py-2">Birim Maliyet</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                    r.stockQuantity <= 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.stockQuantity}
                  </span>
                </td>
                <td className="px-3 py-2">{r.alertThreshold}</td>
                <td className="px-3 py-2">{r.unitCost}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" className="px-3 py-6 text-center text-slate-500">
                  Eşik altı stok yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Basit & şık – önce sahte veriler, sonra API bağlarız:
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState({
    productCount: 0,
    stockCount: 0,
    stockValue: 0,
    lowStockCount: 0,
  });

  // --- API bağlamak istersen (proxy ile /api/products):
  // useEffect(() => {
  //   fetch('/api/products')
  //     .then(r => r.json())
  //     .then(data => {
  //       setProducts(data);
  //       const productCount = data.length;
  //       const stockCount = data.reduce((s, x) => s + (x.stockQuantity || 0), 0);
  //       const stockValue = data.reduce((s, x) => s + (x.stockQuantity || 0) * (x.unitCost || 0), 0);
  //       const lowStockCount = data.filter(x => (x.stockQuantity||0) < (x.alertThreshold||0)).length;
  //       setTotals({ productCount, stockCount, stockValue, lowStockCount });
  //     });
  // }, []);

  // Şimdilik basit demo:
  useEffect(() => {
    const demo = [
      { id: 1, name: "Vida M4", stockQuantity: 12, alertThreshold: 50, unitCost: 3.5 },
      { id: 2, name: "Conta 20mm", stockQuantity: 4, alertThreshold: 20, unitCost: 2.1 },
      { id: 3, name: "Silikon", stockQuantity: 0, alertThreshold: 5, unitCost: 24 },
      { id: 4, name: "Kablo 2x1", stockQuantity: 200, alertThreshold: 40, unitCost: 6.4 },
    ];
    setProducts(demo);
    const productCount = demo.length;
    const stockCount = demo.reduce((s, x) => s + x.stockQuantity, 0);
    const stockValue = demo.reduce((s, x) => s + x.stockQuantity * x.unitCost, 0);
    const lowStockCount = demo.filter(x => x.stockQuantity < x.alertThreshold).length;
    setTotals({ productCount, stockCount, stockValue, lowStockCount });
  }, []);

  const lowStocks = products.filter(p => p.stockQuantity < p.alertThreshold);

  return (
    <div className="page-container">
      {/* Başlık */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">EnvanterX • Panel</h1>
        <p className="text-sm text-slate-500">Durumu tek bakışta görün.</p>
      </div>

      {/* KPI'lar */}
      <div className="grid-4 gap-3">
        <Stat label="Toplam Ürün" value={totals.productCount} tone="indigo" />
        <Stat label="Toplam Stok" value={totals.stockCount} tone="emerald" />
        <Stat label="Toplam Değer" value={totals.stockValue.toLocaleString("tr-TR") + " ₺"} tone="indigo" />
        <Stat label="Eşik Altı" value={totals.lowStockCount} tone="red" />
      </div>

      {/* Sol: Düşük stok, Sağ: Hızlı işlemler + min. grafik kutusu */}
      <div className="mt-4 grid-main">
        <div className="main-left">
          <LowStock rows={lowStocks} />
        </div>
        <div className="main-right">
          <QuickActions />
          <div className="card">
            <div className="card-title">Stok grafiği</div>
            <div className="chart-placeholder">Chart.js için yer tutucu</div>
          </div>
        </div>
      </div>
    </div>
  );
}
