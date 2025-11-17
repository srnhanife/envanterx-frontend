import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const empty = { name:"", stockQuantity:0, unitCost:0, alertThreshold:0 };

export default function ProductFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(empty);

  useEffect(()=>{ if(id){ api.get(`/api/products/${id}`).then(r=>setP(r.data)); } },[id]);
  const set = (k,v)=>setP({...p,[k]:v});

  const submit = async (e) => {
    e.preventDefault();
    if (id) await api.put(`/api/products/${id}`, p);
    else await api.post(`/api/products`, p);
    nav("/products");
  };

  return (
    <div style={{padding:20}}>
      <h2>{id ? "Ürün Düzenle" : "Yeni Ürün"}</h2>
      <form onSubmit={submit} style={{display:"grid",gap:8,maxWidth:360}}>
        <input placeholder="Ad" value={p.name} onChange={e=>set("name",e.target.value)} />
        <input type="number" placeholder="Stok" value={p.stockQuantity} onChange={e=>set("stockQuantity",+e.target.value)} />
        <input type="number" placeholder="Birim maliyet" value={p.unitCost} onChange={e=>set("unitCost",+e.target.value)} />
        <input type="number" placeholder="Eşik" value={p.alertThreshold} onChange={e=>set("alertThreshold",+e.target.value)} />
        <button style={{padding:10,background:"#111",color:"#fff",border:"none",borderRadius:8}}>Kaydet</button>
      </form>
    </div>
  );
}

