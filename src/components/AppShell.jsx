import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Backend Adresi
const API_BASE_URL = "https://envanterx-backend-production.up.railway.app/api";

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
  const navigate = useNavigate();

  // LocalStorage'dan kullanıcı adını al (Yoksa 'Kullanıcı' yazsın)
  const username = localStorage.getItem("auth_username") || "Kullanıcı";
  
  // Kullanıcı adının baş harflerini al (Örn: Ahmet -> AH)
  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // --- ÇIKIŞ FONKSİYONU ---
  const handleLogout = async () => {
    if (!window.confirm("Çıkış yapmak istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("auth_basic");

    try {
      // Backend'e çıkış isteği gönder
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { 
            Authorization: token 
          },
        });
      }
    } catch (err) {
      console.error("Sunucuya ulaşılamadı, yerel çıkış yapılıyor.");
    }

    // Tarayıcı hafızasını temizle
    localStorage.removeItem("auth_basic");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("user_role");

    // Login sayfasına yönlendir
    navigate("/login");
  };

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
        
        {/* SAĞ TARAFTAKİ GÜNCELLEME: LOGOUT BUTONU */}
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* Kırmızı Çıkış Butonu */}
          <button 
            onClick={handleLogout}
            style={{
                backgroundColor: '#dc2626', // Kırmızı renk
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ÇIKIŞ YAP
          </button>

          <span className="topbar-brand" style={{ display: 'none md:block' }}>EnvanterX</span>
          
          {/* Dinamik Kullanıcı Harfleri */}
          <div className="user-chip" title={username}>
            {getInitials(username)}
          </div>
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
        
        {/* Mobilde de çıkış yapabilmek için menünün en altına ek buton (Opsiyonel) */}
        <div style={{ padding: '20px', borderTop: '1px solid #eee', marginTop: 'auto' }}>
             <button 
                onClick={handleLogout}
                style={{ width: '100%', padding: '10px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', cursor: 'pointer' }}
             >
                Oturumu Kapat
             </button>
        </div>

      </aside>

      {open && <div className="menu-backdrop" onClick={() => setOpen(false)} />}

      <main className="app-content">{children}</main>
    </div>
  );
}