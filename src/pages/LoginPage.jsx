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
    <div className="login-container">
      <h2>EnvanterX • Giriş</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Oturum aç</button>
      </form>
    </div>
  );
}
