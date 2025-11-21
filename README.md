# ENVANTERX – STOK YÖNETİM SİSTEMİ

## 1. KURULUM VE ÇALIŞTIRMA ADIMLARI

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Gerekli Paketleri Yükleyin:**
    ```bash
    npm install
    ```

2.  **Uygulamayı Başlatın:**
    ```bash
    npm start
    ```
    Uygulama tarayıcınızda otomatik olarak açılacaktır.

---

## 2. KULLANICI GİRİŞ BİLGİLERİ

Sistemi test etmek için aşağıdaki kullanıcı bilgilerini kullanabilirsiniz:

| Rol | Kullanıcı Adı | Şifre | Yetkiler |
| :--- | :--- | :--- | :--- |
| **Admin (Yönetici)** | `admin` | `admin123` | Ürün ekleme, silme, güncelleme, stok hareketi yapma, raporları görme. |
| **User (Kullanıcı)** | `ali` | `ali123` | Sadece ürünleri listeleme ve raporları görüntüleme (Değişiklik yapamaz). |

---

## 3. API ENDPOINT LİSTESİ

Backend API dokümantasyonuna (Swagger) aşağıdaki linkten ulaşabilirsiniz:
👉 **Swagger UI:** [https://envanterx-backend-production.up.railway.app/swagger-ui/index.html](https://envanterx-backend-production.up.railway.app/swagger-ui/index.html)

Sistemin kullandığı temel servisler:

*   **Base URL:** `https://envanterx-backend-production.up.railway.app/api`

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Kullanıcı girişi ve token alma |
| `GET` | `/products` | Tüm ürünleri listeleme |
| `POST` | `/products` | Yeni ürün oluşturma (Sadece Admin) |
| `PUT` | `/products/{id}` | Ürün güncelleme (Sadece Admin) |
| `DELETE` | `/products/{id}` | Ürün silme (Sadece Admin) |
| `POST` | `/stock/purchase` | Stok artırma / Satın alma işlemi |
| `POST` | `/stock/sell` | Stok azaltma / Satış işlemi |
| `GET` | `/reports/total-value` | Toplam stok değerini raporlama |

---

## 4. CANLI PROJE LİNKİ

Projenin canlı çalışan versiyonuna aşağıdaki linkten ulaşabilirsiniz:

👉 **Frontend Erişim Adresi:** [http://35.205.246.217](http://35.205.246.217)
