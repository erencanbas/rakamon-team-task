# Task Management Application

Bu proje kullanıcıların görevleri oluşturabileceği, düzenleyebileceği ve silebileceği bir görev yönetim uygulamasını içerir. Admin ve normal kullanıcı rolleri ile yetkilendirme yapılmıştır. Kullanıcı ekleme işlemi yalnızca adminler tarafından gerçekleştirilebilir.

## Özellikler
- **Kullanıcı Girişi**: TC kimlik numarası ve şifre ile giriş yapma.
- **Görev Yönetimi**:
  - **Admin**: Tüm görevleri görebilir, düzenleyebilir, silebilir ve herkese görev atayabilir.
  - **User**: Sadece kendi görevlerini görebilir, düzenleyebilir ve silebilir; kendine görev atayabilir.
- **Kullanıcı Yönetimi**:
  - Admin, `TaskManager` ekranında "Kullanıcı Ekle" butonu ile yeni kullanıcılar (admin veya user rolüyle) oluşturabilir.
  - TC kimlik numarası 11 haneli olmalıdır (frontend ve backend'de doğrulama yapılır).
- **Kalıcı Veri**: Görevler (`tasks.json`) ve kullanıcılar (`users.json`) JSON dosyalarında saklanır; backend resetlense bile veriler kaybolmaz.
- **Form Doğrulama**: Görev ekleme ve kullanıcı ekleme formlarında tüm alanlar zorunludur (`required`).
- **Toast Bildirimleri**: İşlemler için kullanıcı dostu bildirimler (`react-toastify`).
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarla uyumlu.

## Kurulum

### Gereksinimler
- Node.js  (min v20.x önerilir)
- npm

### Adımlar
1. **Repoyu Klonla**
   ```bash
   git clone <repo-url>
   cd task-manager-app
   ```

2. **Backend Kurulumu**
   ```bash
   cd backend
   npm install
   node index.js
   ```

3. **Frontend Kurulumu**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Uygulamayı Test Et**
   - Tarayıcıda [http://localhost:3000](http://localhost:3000) adresine gidin.
   - Varsayılan kullanıcılarla giriş yapın:
     - **Admin**: TC: `43212354366`, Şifre: `admin123`
     - **User**: TC: `85423167894`, Şifre: `user123`

## Kullanım
- **Giriş**: TC kimlik numarası ve şifre ile giriş yapın.
- **Görev Ekleme**: Görev başlığı, açıklama ve kullanıcı seçimi (admin için) yaparak "Add Task" butonuna basın. Tüm alanlar zorunludur.
- **Görev Düzenleme/Silme**: Görev listesindeki "Toggle Status" ile durumu değiştirin veya "Delete" ile silin.
- **Kullanıcı Ekleme**: Admin giriş yaptığında, "Kullanıcı Ekle" butonuna tıklayın. Açılan popup'ta kullanıcı adı, 11 haneli TC kimlik numarası, şifre ve rol girin. Tüm alanlar zorunludur.

## Dosya Yapısı
```
backend/
  ├── index.js       # API endpoint'leri, dosya işlemleri ve TC kimlik numarası doğrulama
  ├── users.json     # Kullanıcı verileri
  ├── tasks.json     # Görev verileri
frontend/
  ├── src/
      ├── Login.js       # Giriş ekranı
      ├── TaskManager.js # Görev yönetimi ve kullanıcı ekleme ekranı
      ├── css/
          ├── index.css
          ├── task-manager.css
```




