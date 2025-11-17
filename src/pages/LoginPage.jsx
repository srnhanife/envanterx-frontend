import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const basic = "Basic " + btoa(`${username}:${password}`);
    localStorage.setItem("auth_basic", basic);

    try {
      const res = await api.get("/auth/me");
      if (res.status === 200) {
        navigate("/products");
      } else {
        setError("Giriş başarısız (kullanıcı/şifre).");
      }
    } catch (err) {
      setError("Giriş başarısız (kullanıcı/şifre).");
    }
  };

  return (
    <div className="page-center">
      <div className="card login-card">
        <h2 className="login-title">EnvanterX</h2>
        <p className="login-sub">Giriş yaparak devam et</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="label">Kullanıcı adı</label>
          <input className="form-control" type="text" placeholder="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label className="label">Şifre</label>
          <input className="form-control" type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="alert-error">{error}</p>}
          <div className="login-actions">
            <button type="submit" className="btn-primary">Oturum aç</button>
          </div>
        </form>
      </div>
    </div>
  );
}
