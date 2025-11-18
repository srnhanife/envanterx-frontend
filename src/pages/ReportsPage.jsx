import React, { useEffect, useMemo, useState } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import api from "../api";
import { getMovementCounterparty, getMovementNoteBody } from "../utils/movementUtils";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const palette = ["#4f46e5", "#22c55e", "#fbbf24", "#ef4444", "#06b6d4", "#a855f7", "#0ea5e9"];
const fallbackProducts = [
  { id: 1, name: "Vida M4", stockQuantity: 120, unitCost: 3.5, alertThreshold: 50 },
  { id: 2, name: "Conta 20mm", stockQuantity: 4, unitCost: 2.1, alertThreshold: 20 },
  { id: 3, name: "Silikon", stockQuantity: 0, unitCost: 24, alertThreshold: 5 },
  { id: 4, name: "Kablo 2x1", stockQuantity: 200, unitCost: 6.4, alertThreshold: 40 },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatNumber = (value) => new Intl.NumberFormat("tr-TR").format(value || 0);

const formatShortDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getWeekStart = () => {
  const now = new Date();
  const clone = new Date(now);
  const day = clone.getDay();
  const diff = (day + 6) % 7; // Pazartesi başlangıç
  clone.setDate(clone.getDate() - diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const createDailyBuckets = (days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("tr-TR", { weekday: "short" }),
    });
  }
  return buckets;
};

const createMonthlyBuckets = (count) => {
  const buckets = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("tr-TR", { month: "short" }),
    });
  }
  return buckets;
};

const isAfterDate = (value, comparison) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= comparison;
};

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [movementErr, setMovementErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, movementsRes] = await Promise.allSettled([
          api.get("/products"),
          api.get("/reports/movements?days=180"),
        ]);

        if (productsRes.status === "fulfilled") {
          setItems(productsRes.value.data || []);
        } else {
          console.error("Products fetch err", productsRes.reason);
          setErr("Canlı veri alınamadı, örnek veriler gösteriliyor.");
          setItems(fallbackProducts);
        }

        if (movementsRes.status === "fulfilled") {
          setMovements(movementsRes.value.data || []);
        } else {
          console.error("Movements fetch err", movementsRes.reason);
          setMovementErr("Hareket verileri alınamadı.");
          setMovements([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStock = useMemo(() => items.reduce((s, x) => s + (x.stockQuantity || 0), 0), [items]);
  const totalValue = useMemo(
    () => items.reduce((s, x) => s + (x.stockQuantity || 0) * (x.unitCost || 0), 0),
    [items]
  );
  const lowStockItems = useMemo(
    () => items.filter((x) => (x.stockQuantity || 0) < (x.alertThreshold || 0)),
    [items]
  );
  const topValuable = useMemo(
    () =>
      [...items]
        .map((x) => ({ ...x, totalValue: (x.stockQuantity || 0) * (x.unitCost || 0) }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5),
    [items]
  );

  const doughnutData = useMemo(
    () => ({
      labels: items.map((x) => x.name),
      datasets: [
        {
          data: items.map((x) => x.stockQuantity || 0),
          backgroundColor: items.map((_, idx) => palette[idx % palette.length]),
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
          label: "Toplam Değer",
          data: items.map((x) => (x.stockQuantity || 0) * (x.unitCost || 0)),
          backgroundColor: "#4f46e5",
          borderRadius: 8,
        },
      ],
    }),
    [items]
  );

  const weekStart = useMemo(() => getWeekStart(), []);

  const weeklyImports = useMemo(() => {
    if (!movements.length) return [];
    return movements
      .filter((m) => m.type === "SATIN_ALMA" && isAfterDate(m.createdAt, weekStart))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [movements, weekStart]);

  const weeklyExports = useMemo(() => {
    if (!movements.length) return [];
    return movements
      .filter((m) => m.type === "SATIS" && isAfterDate(m.createdAt, weekStart))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [movements, weekStart]);

  const weeklyChartData = useMemo(() => {
    const buckets = createDailyBuckets(7);
    const sales = new Array(buckets.length).fill(0);
    const purchases = new Array(buckets.length).fill(0);

    movements.forEach((movement) => {
      if (!movement.createdAt) return;
      const key = movement.createdAt.slice(0, 10);
      const idx = buckets.findIndex((bucket) => bucket.key === key);
      if (idx === -1) return;
      const amount = Math.abs(movement.quantity || 0);
      if (movement.type === "SATIS") {
        sales[idx] += amount;
      } else if (movement.type === "SATIN_ALMA") {
        purchases[idx] += amount;
      }
    });

    return {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Satış",
          data: sales,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.15)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Satın Alma",
          data: purchases,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [movements]);

  const hasWeeklyData = useMemo(
    () => weeklyChartData.datasets?.some((dataset) => dataset.data.some((value) => value > 0)),
    [weeklyChartData]
  );

  const monthlyChartData = useMemo(() => {
    const buckets = createMonthlyBuckets(6);
    const totals = new Array(buckets.length).fill(0);

    movements.forEach((movement) => {
      if (movement.type !== "SATIS" || !movement.createdAt) return;
      const key = movement.createdAt.slice(0, 7);
      const idx = buckets.findIndex((bucket) => bucket.key === key);
      if (idx === -1) return;
      const qty = Math.abs(movement.quantity || 0);
      const unitCost = movement.product?.unitCost || 0;
      totals[idx] += qty * unitCost;
    });

    return {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Aylık Satış Geliri",
          data: totals,
          backgroundColor: "#3b82f6",
          borderRadius: 8,
        },
      ],
    };
  }, [movements]);

  const hasMonthlyData = useMemo(
    () => monthlyChartData.datasets?.some((dataset) => dataset.data.some((value) => value > 0)),
    [monthlyChartData]
  );

  const weeklySummary = useMemo(
    () => ({
      imports: weeklyImports.reduce((sum, item) => sum + Math.abs(item.quantity || 0), 0),
      exports: weeklyExports.reduce((sum, item) => sum + Math.abs(item.quantity || 0), 0),
    }),
    [weeklyImports, weeklyExports]
  );

  const downloadFile = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleGenerateReport = () => {
    if (!items.length) return;
    const header = "Ürün,Stok,Birim Fiyat,Eşik,Toplam Değer";
    const rows = items.map((item) => {
      const { name, stockQuantity = 0, unitCost = 0, alertThreshold = 0 } = item;
      const total = (stockQuantity || 0) * (unitCost || 0);
      return `${name},${stockQuantity},${unitCost},${alertThreshold},${total}`;
    });
    const summary = [
      "",
      `Toplam Stok,${totalStock}`,
      `Toplam Değer,${totalValue}`,
      `Eşik Altı Ürün,${lowStockItems.length}`,
    ];
    const csv = [header, ...rows, ...summary].join("\n");
    downloadFile(csv, `stok-raporu-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExportPDF = () => {
    if (!items.length) return;
    const rows = items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.stockQuantity || 0}</td>
          <td>${item.alertThreshold || 0}</td>
          <td>${formatCurrency((item.stockQuantity || 0) * (item.unitCost || 0))}</td>
        </tr>`
      )
      .join("");

    const summary = `
      <p><strong>Toplam Stok:</strong> ${totalStock}</p>
      <p><strong>Toplam Değer:</strong> ${formatCurrency(totalValue)}</p>
      <p><strong>Eşik Altı Ürün:</strong> ${lowStockItems.length}</p>
    `;

    const doc = `
      <html>
        <head>
          <title>Stok Raporu</title>
          <style>
            body{ font-family: 'Inter', Arial, sans-serif; padding:24px; }
            h1{ margin-bottom:4px; }
            table{ width:100%; border-collapse:collapse; margin-top:16px; }
            th,td{ border:1px solid #d1d5db; padding:8px 10px; text-align:left; font-size:13px; }
            th{ background:#f8fafc; text-transform:uppercase; font-size:11px; letter-spacing:0.08em; }
            footer{ margin-top:32px; font-size:12px; color:#6b7280; }
          </style>
        </head>
        <body>
          <h1>Stok Raporu</h1>
          <p>${new Date().toLocaleString("tr-TR")}</p>
          ${summary}
          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Stok</th>
                <th>Eşik</th>
                <th>Toplam Değer</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <footer>Bu PDF tarayıcınızın yazdır/ PDF kaydet özelliği ile oluşturuldu.</footer>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(doc);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Analitik</p>
          <h1>Raporlar</h1>
          <p className="muted">Stok dağılımı, toplam değer ve kritik ürün görünümü</p>
        </div>
        <div className="hero-actions">
          <button className="btn ghost" onClick={handleExportPDF} disabled={loading || !items.length}>
            PDF Çıkar
          </button>
          <button className="btn-primary" onClick={handleGenerateReport} disabled={loading || !items.length}>
            Rapor Oluştur
          </button>
        </div>
      </section>

      <section className="page-card reports-card">
        {loading ? (
          <div className="reports-placeholder">Veriler yükleniyor...</div>
        ) : (
          <>
            {err && <div className="alert-warning">{err}</div>}
            {movementErr && <div className="alert-warning">{movementErr}</div>}
            <div className="reports-kpis">
              <KPI label="Toplam Stok" value={totalStock} />
              <KPI label="Toplam Değer" value={formatCurrency(totalValue)} />
              <KPI label="Eşik Altı Ürün" value={lowStockItems.length} danger={lowStockItems.length > 0} />
              <KPI label="Ürün Çeşidi" value={items.length} />
            </div>

            <div className="reports-grid">
              <Card title="Stok Dağılımı">
                {items.length ? (
                  <div className="chart-wrapper">
                    <Doughnut data={doughnutData} options={{ plugins: { legend: { position: "bottom" } } }} />
                  </div>
                ) : (
                  <EmptyState text="Gösterilecek stok bulunamadı" />
                )}
              </Card>

              <Card title="Ürün Bazlı Toplam Değer">
                {items.length ? (
                  <div className="chart-wrapper">
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { ticks: { callback: (v) => formatCurrency(v) } } },
                      }}
                    />
                  </div>
                ) : (
                  <EmptyState text="Toplam değer grafiği için veri yok" />
                )}
              </Card>
            </div>

            <div className="reports-grid">
              <Card title="Haftalık Satış & Alım (Adet)">
                {hasWeeklyData ? (
                  <div className="chart-wrapper">
                    <Line
                      data={weeklyChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: "bottom" } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                ) : (
                  <EmptyState text="Son 7 güne ait hareket bulunamadı" />
                )}
              </Card>

              <Card title="Aylık Satış Trendleri (₺)">
                {hasMonthlyData ? (
                  <div className="chart-wrapper">
                    <Bar
                      data={monthlyChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { ticks: { callback: (v) => formatCurrency(v) } } },
                      }}
                    />
                  </div>
                ) : (
                  <EmptyState text="Aylık satış verisi bulunamadı" />
                )}
              </Card>
            </div>

            <div className="reports-split">
              <Card title="En Değerli 5 Ürün">
                {topValuable.length ? (
                  <ul className="reports-list">
                    {topValuable.map((item) => (
                      <li key={item.id}>
                        <span>{item.name}</span>
                        <strong>{formatCurrency(item.totalValue)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState text="Ürün bulunamadı" compact />
                )}
              </Card>

              <Card title="Eşik Altındaki Ürünler">
                {lowStockItems.length ? (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Ürün</th>
                        <th>Stok</th>
                        <th>Eşik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.stockQuantity}</td>
                          <td>{item.alertThreshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState text="Tüm ürünler eşik üzerinde" compact />
                )}
              </Card>
            </div>

            <div className="reports-split">
              <Card title={`Bu Hafta İthalat (${formatNumber(weeklySummary.imports)} adet)`}>
                {weeklyImports.length ? (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Ürün</th>
                        <th>Kaynak</th>
                        <th>Adet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyImports.map((movement) => (
                        <tr key={movement.id}>
                          <td>{formatShortDate(movement.createdAt)}</td>
                          <td>{movement.product?.name || "-"}</td>
                          <td>
                            <div>{getMovementCounterparty(movement)}</div>
                            {getMovementNoteBody(movement.note) && (
                              <div className="table-note">{getMovementNoteBody(movement.note)}</div>
                            )}
                          </td>
                          <td>{Math.abs(movement.quantity || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState text="Bu hafta giriş işlemi yok" compact />
                )}
              </Card>

              <Card title={`Bu Hafta İhracat (${formatNumber(weeklySummary.exports)} adet)`}>
                {weeklyExports.length ? (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Ürün</th>
                        <th>Müşteri</th>
                        <th>Adet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyExports.map((movement) => (
                        <tr key={movement.id}>
                          <td>{formatShortDate(movement.createdAt)}</td>
                          <td>{movement.product?.name || "-"}</td>
                          <td>
                            <div>{getMovementCounterparty(movement)}</div>
                            {getMovementNoteBody(movement.note) && (
                              <div className="table-note">{getMovementNoteBody(movement.note)}</div>
                            )}
                          </td>
                          <td>{Math.abs(movement.quantity || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState text="Bu hafta çıkış işlemi yok" compact />
                )}
              </Card>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function KPI({ label, value, danger }) {
  return (
    <div className={`report-kpi ${danger ? "danger" : ""}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="report-card">
      <div className="report-card-head">
        <h4>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text, compact }) {
  return <div className={`reports-empty ${compact ? "compact" : ""}`}>{text}</div>;
}
