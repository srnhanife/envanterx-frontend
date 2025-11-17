import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductFormPage from "./pages/ProductFormPage";
import AppShell from "./components/AppShell";
import ReportsPage from "./pages/ReportsPage";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import "./App.css";



const Protected = ({children}) => {
  const ok = !!localStorage.getItem("auth_basic");
  return ok ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/*" element={
          <Protected>
            <AppShell>
              <Routes>
                <Route path="/" element={<Navigate to="/products" />} />
                <Route path="/products" element={<ProductsPage/>} />
                <Route path="/products/new" element={<ProductFormPage/>} />
                <Route path="/products/:id" element={<ProductFormPage/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/transactions" element={<TransactionsPage/>} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </AppShell>
          </Protected>
        }/>
      </Routes>
    </BrowserRouter>
  );
}
