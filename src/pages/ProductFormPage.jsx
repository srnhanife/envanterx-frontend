import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const empty = { name:"", stockQuantity:0, unitCost:0, alertThreshold:0, imageUrl:"" }; 
// imageUrl'yi state'e ekledik

export default function ProductFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef(null);

  // Düzenleme modunda (id varsa), mevcut URL'yi p state'ine çeker
  useEffect(()=>{ 
    if(id){ 
      api.get(`/api/products/${id}`).then(r=>setP(r.data)); 
    } 
  },[id]);
  
  // input değişikliklerini yönetir
  const set = (k,v)=>setP({...p,[k]:v});

  const submit = async (e) => {
    e.preventDefault();
    let imageUrl = p.imageUrl || ""; // Mevcut URL'yi (düzenleme modunda) veya boş string'i al

    // ----------------------------------------------------------------------
    // Aşama 1: Resim Yükleme (Sadece yeni bir dosya seçildiyse)
    // ----------------------------------------------------------------------
    if (imageFile) {
        const formData = new FormData();
        // 'image' key'i, Spring Boot'taki @RequestParam("image") ile eşleşmeli
        formData.append("image", imageFile);

        try {
            // Backend'deki StorageController endpoint'ine yükleme isteği
            const uploadResponse = await api.post('/storage/upload', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Backend'den dönen sahte/gerçek URL'yi yakala
            imageUrl = uploadResponse.data;

        } catch (uploadError) {
            console.error('Resim yüklenemedi:', uploadError);
            alert('Hata: Resim sunucuya yüklenemedi. Ürün kaydedilemedi.');
            return; // Hata durumunda ürün kaydına devam etme
        }
    }
    
    
    
    // Kaydedilecek nihai veri nesnesi (DTO formatında)
    const data = { 
        ...p, 
        imageUrl: imageUrl // Yeni veya mevcut URL
    };

    try {
        if (id) {
          // PUT (Düzenle) - Stok güncelleme kontrolü Serviste yapılıyor
          await api.put(`/api/products/${id}`, data);
        } else {
          // POST (Yeni Ürün)
          await api.post(`/api/products`, data); 
          setP(empty); // Formu temizle
          setImageFile(null); // Dosya state'ini temizle
          if (fileRef.current) fileRef.current.value = ""; // Input değerini temizle
        }
        
        nav("/products"); // Başarılı olursa ürün listesine yönlendir
        
    } catch (saveError) {
        console.error('Ürün kaydetme hatası:', saveError);
        alert('Hata: Ürün bilgileri kaydedilemedi.');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>{id ? "Ürün Düzenle" : "Yeni Ürün"}</h2>
      <form onSubmit={submit} style={{display:"grid",gap:8,maxWidth:360}}>
        <input placeholder="Ad" value={p.name} onChange={e=>set("name",e.target.value)} />
        <input type="number" placeholder="Stok" value={p.stockQuantity} onChange={e=>set("stockQuantity",+e.target.value)} />
        <input type="number" placeholder="Birim maliyet" value={p.unitCost} onChange={e=>set("unitCost",+e.target.value)} />
        <input type="number" placeholder="Eşik" value={p.alertThreshold} onChange={e=>set("alertThreshold",+e.target.value)} />
        
        {/* Resim Seçme Alanı */}
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={e => setImageFile(e.target.files?.[0] || null)}
        />
        {/* Düzenleme modunda mevcut resmi gösterebilirsiniz: */}
        {id && p.imageUrl && !imageFile && (
            <img src={p.imageUrl} alt={p.name} style={{ width: 100, height: 100, objectFit: 'cover' }} />
        )}
        
        <button style={{padding:10,background:"#111",color:"#fff",border:"none",borderRadius:8}}>Kaydet</button>
      </form>
    </div>
  );
}