import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="text-sm font-semibold text-indigo-700">EnvanterX</Link>
        <nav className="flex items-center gap-3 text-xs">
          <Link to="/products" className="text-slate-600 hover:text-slate-900">Ürünler</Link>
          <Link to="/reports" className="text-slate-600 hover:text-slate-900">Raporlar</Link>
          <Link to="/reports">Raporlar</Link>
        </nav>
      </div>
    </header>
  );
}
