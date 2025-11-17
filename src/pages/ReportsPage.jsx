import React, { useEffect, useMemo, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ReportsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setItems)
      .catch(() =>
        setItems([
          { id: 1, name: "Vida M4", stockQuantity: 120, unitCost: 3.5, alertThreshold: 50 },
          { id: 2, name: "Conta 20mm", stockQuantity: 4, unitCost: 2.1, alertThreshold: 20 },
          { id: 3, name: "Silikon", stockQuantity: 0, unitCost: 24, alertThreshold: 5 },
          { id: 4, name: "Kablo 2x1", stockQuantity: 200, unitCost: 6.4, alertThreshold: 40 },
        ])
      );
  }, []);

  const totalStock = useMemo(() => items.reduce((s, x) => s + (x.stockQuantity || 0), 0), [items]);
  const totalValue = useMemo(
    () => items.reduce((s, x) => s + (x.stockQuantity || 0) * (x.unitCost || 0), 0),
    [items]
  );
  const lowCount = useMemo(
    () => items.filter((x) => (x.stockQuantity || 0) < (x.alertThreshold || 0)).length,
    [items]
  );

  const doughnutData = useMemo(
    () => ({
      labels: items.map((x) => x.name),
      datasets: [
        {
          data: items.map((x) => x.stockQuantity || 0),
          backgroundColor: ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"],
        },
      ],
    }),
    [items]
  );

  const barData = useMemo(
    () => ({
      labels: items.map((x) => x.name),
      datasets: [
        {
          label: "Toplam Değer (₺)",
          data: items.map((x) => (x.stockQuantity || 0) * (x.unitCost || 0)),
          backgroundColor: "#4f46e5",
        },
      ],
    }),
    [items]
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Ürün Raporları</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <KPI label="Toplam Stok" value={totalStock} />
        <KPI label="Toplam Değer" value={totalValue.toLocaleString("tr-TR") + " ₺"} />
        <KPI label="Eşik Altı Ürün" value={lowCount} danger={lowCount > 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Stok Dağılımı (Doughnut)">
          <Doughnut data={doughnutData} />
        </Card>
        <Card title="Ürün Bazlı Toplam Değer (Bar)">
          <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
        </Card>
      </div>
    </div>
  );
}

function KPI({ label, value, danger }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: "#fff" }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: danger ? "#ef4444" : "#111827" }}>{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: "#fff" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
