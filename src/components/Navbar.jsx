import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">EnvanterX</Link>
        <nav className="site-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/products" className="nav-link">Ürünler</Link>
          <Link to="/transactions" className="nav-link">Hareketler</Link>
          <Link to="/reports" className="nav-link">Raporlar</Link>
        </nav>
      </div>
    </header>
  );
}
