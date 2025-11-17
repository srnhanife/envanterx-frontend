import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const navItems = [
  {
    to: "/products",
    label: "Stok Artır / Azalt",
    description: "Ürünleri yönet, stok hareketi yap.",
  },
  {
    to: "/transactions",
    label: "Hareketler",
    description: "Son 1 haftadaki giriş/çıkışları izle.",
  },
  {
    to: "/reports",
    label: "Raporlar",
    description: "Özet ve grafikler, performans takibi.",
  },
];

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-shell ${open ? "shell-menu-open" : ""}`}>
      <header className="app-topbar">
        <div className="topbar-left">
          <button
            className="menu-button"
            aria-label="Menüyü aç"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="topbar-page">
            <div className="page-pill">Stoklar</div>
            <div className="page-sub">Genel görünüm · güncel envanter</div>
          </div>
        </div>
        <div className="topbar-right">
          <span className="topbar-brand">EnvanterX</span>
          <div className="user-chip">AB</div>
        </div>
      </header>

      <aside className={`side-menu ${open ? "show" : ""}`}>
        <div className="side-menu-header">
          <div>
            <div className="side-menu-title">Menü</div>
            <div className="side-menu-sub">Sayfalar arası hızlı geçiş</div>
          </div>
          <button className="menu-close" onClick={() => setOpen(false)} aria-label="Kapat">
            ✕
          </button>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `side-link ${isActive ? "active" : ""}`
              }
            >
              <span className="side-link-label">{item.label}</span>
              <span className="side-link-desc">{item.description}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {open && <div className="menu-backdrop" onClick={() => setOpen(false)} />}

      <main className="app-content">{children}</main>
    </div>
  );
}


