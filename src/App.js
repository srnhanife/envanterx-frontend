import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ProductFormPage from "./pages/ProductFormPage";
import Navbar from "./components/Navbar";
import ReportsPage from "./pages/ReportsPage";


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
            <div>
              <Navbar/>
              <Routes>
                <Route path="/" element={<Navigate to="/products" />} />
                <Route path="/products" element={<ProductsPage/>} />
                <Route path="/products/new" element={<ProductFormPage/>} />
                <Route path="/products/:id" element={<ProductFormPage/>} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </div>
          </Protected>
        }/>
      </Routes>
    </BrowserRouter>
  );
}
