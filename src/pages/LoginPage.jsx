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
        // Kullanıcı bilgilerini kaydet
        localStorage.setItem("auth_username", username);
        const role = username === 'admin' ? 'ADMIN' : 'USER';
        localStorage.setItem("user_role", role);
        
        navigate("/products");
      } else {
        setError("Giriş başarısız (kullanıcı/şifre).");
      }
    } catch (err) {
      setError("Giriş başarısız (kullanıcı/şifre).");
    }
  };

  // --- TASARIM STİLLERİ ---
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#e0f2fe",
      fontFamily: "sans-serif",
      margin: 0,
      padding: 0
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "24px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center",
      border: "1px solid #f1f5f9"
    },
    // --- YENİ EKLENEN LOGO STİLİ ---
    logo: {
      width: "80px",      // Logonun genişliği 
      height: "auto",     // Orantılı yükseklik
      marginBottom: "10px", // EnvanterX yazısı ile arasındaki boşluk
      display: "block",   
      marginLeft: "auto", // Ortalamak için
      marginRight: "auto" // Ortalamak için
    },
    // -------------------------------
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#0f172a",
      marginBottom: "5px",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "30px",
    },
    inputGroup: {
      marginBottom: "20px",
      textAlign: "left",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#475569",
      marginLeft: "2px"
    },
    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      backgroundColor: "#f8fafc"
    },
    button: {
      width: "100%",
      padding: "16px",
      backgroundColor: "#0ea5e9",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
      transition: "background-color 0.2s"
    },
    error: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "14px",
      marginBottom: "20px",
      border: "1px solid #fecaca",
      fontWeight: "500"
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Beyaz Kart */}
      <div style={styles.card}>
        
        {/* --- LOGO RESMİ ALANIDIR */}
        
        <img 
          src="/depo_logo.png" 
          alt="EnvanterX Logo" 
          style={styles.logo} 
        />
        {/* --------------------------------- */}

        <h2 style={styles.title}>EnvanterX</h2>
        <p style={styles.subtitle}>Giriş yaparak devam edebilirsiniz</p>

        <form onSubmit={handleSubmit}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kullanıcı Adı</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div className="login-actions">
            <button type="submit" style={styles.button}>
              OTURUM AÇ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}