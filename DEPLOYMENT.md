# 🚀 Vercel + Render.com Deployment Rehberi

Bu rehber, React (Vite) frontend ve FastAPI backend'inizi tamamen **ücretsiz ve kalıcı** olarak deploy etmeniz için hazırlanmıştır.

## 📋 İçindekiler

1. [Ön Hazırlık](#ön-hazırlık)
2. [Backend Hazırlığı (FastAPI + Render.com)](#backend-hazırlığı-fastapi--rendercom)
3. [Frontend Hazırlığı (React + Vite + Vercel)](#frontend-hazırlığı-react--vite--vercel)
4. [Deployment Sırası](#deployment-sırası)
5. [Troubleshooting](#troubleshooting)

---

## Ön Hazırlık

### Gereksinimler
- ✅ GitHub hesabı
- ✅ Vercel hesabı (GitHub ile sign-up)
- ✅ Render.com hesabı (GitHub ile sign-up)
- ✅ Git yüklü ve projeniz bir Git repository'de

### Adım 1: GitHub'a Proje Yükleme

Eğer projeniz henüz GitHub'da değilse:

```bash
# Proje klasörünüzde
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluşturduktan sonra
git remote add origin https://github.com/KULLANICI-ADINIZ/REPO-ADINIZ.git
git branch -M main
git push -u origin main
```

> [!TIP]
> Repository'nizi **private** tutabilirsiniz, hem Vercel hem Render.com private repo'ları destekler.

---

## Backend Hazırlığı (FastAPI + Render.com)

### Adım 1: Backend Kodunu Güncelleyin

#### 1.1 `main.py` - Dinamik PORT ve CORS Yapılandırması

**Dosya**: `backend/main.py`

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.upload import router as upload_router
from api.files import router as files_router
from api.companies import router as companies_router

app = FastAPI(title="Form Yönetim Sistemi", version="1.0.0")

# CORS yapılandırması - Production ve Development ortamları için
# Environment variable'dan allowed origins listesi al
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Dinamik origins listesi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(files_router, prefix="/api", tags=["files"])
app.include_router(companies_router, prefix="/api", tags=["companies"])

@app.get("/")
async def root():
    return {"message": "Form Yönetim Sistemi API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Uvicorn server'ı çalıştırma (local development için)
if __name__ == "__main__":
    import uvicorn
    # Render.com otomatik PORT atar, yoksa 8000 kullan
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
```

**Önemli Değişiklikler**:
- ✅ `PORT` environment variable'ını okuyor (Render otomatik atar)
- ✅ `ALLOWED_ORIGINS` environment variable'dan CORS listesi alıyor
- ✅ `host="0.0.0.0"` ile tüm network interface'lerden erişime izin veriyor

---

#### 1.2 `requirements.txt` - Production Dependencies

**Dosya**: `backend/requirements.txt`

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12
openpyxl==3.1.5
python-docx==1.1.2
pandas==2.2.3
aiofiles==24.1.0
gunicorn==21.2.0
```

**Yeni Ekleme**: `gunicorn` - Production-ready WSGI server

---

#### 1.3 `render.yaml` - Infrastructure as Code (Opsiyonel)

**Dosya**: `render.yaml` (Proje root'unda)

Bu dosya **opsiyoneldir** ancak deployment'ı otomatikleştirir:

```yaml
services:
  - type: web
    name: saka-qms-backend
    env: python
    region: frankfurt  # EU bölgesi, Türkiye'ye yakın
    plan: free
    branch: main
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: "3.11"
      - key: ALLOWED_ORIGINS
        value: "https://your-app.vercel.app"  # Vercel URL'inizi buraya yazın
    healthCheckPath: /health
```

> [!NOTE]
> `render.yaml` kullanmak isteğe bağlıdır. Manuel dashboard'dan da ayarlayabilirsiniz.

---

### Adım 2: Render.com'da Deployment

#### 2.1 Render Dashboard

1. [render.com](https://render.com) → "Sign In with GitHub"
2. **"New +"** → **"Web Service"** seçin
3. GitHub repository'nizi bağlayın

#### 2.2 Konfigürasyon Ayarları

| Alan | Değer |
|------|-------|
| **Name** | `saka-qms-backend` (veya istediğiniz isim) |
| **Region** | `Frankfurt (EU Central)` (Türkiye'ye yakın) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

#### 2.3 Environment Variables

Render dashboard'da **Environment** sekmesine gidin:

| Key | Value | Açıklama |
|-----|-------|----------|
| `PYTHON_VERSION` | `3.11` | Python versiyonu |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://your-app.vercel.app` | CORS için izinli domainler |

> [!WARNING]
> `ALLOWED_ORIGINS` içindeki `https://your-app.vercel.app` kısmını **Vercel deployment'tan sonra** güncelleyeceksiniz!

#### 2.4 Deploy

- **"Create Web Service"** butonuna tıklayın
- Build log'ları izleyin (~2-3 dakika)
- Deploy tamamlandığında **URL'inizi** kopyalayın (örn: `https://saka-qms-backend.onrender.com`)

#### 2.5 Test

Tarayıcınızda:
```
https://saka-qms-backend.onrender.com/health
```

Response:
```json
{"status": "healthy"}
```

✅ Backend hazır!

---

## Frontend Hazırlığı (React + Vite + Vercel)

### Adım 1: Environment Variables

#### 1.1 `.env` (Local Development)

**Dosya**: `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
```

#### 1.2 `.env.production` (Vercel Production)

**Dosya**: `frontend/.env.production`

```env
VITE_API_URL=https://saka-qms-backend.onrender.com
```

> [!IMPORTANT]
> `https://saka-qms-backend.onrender.com` kısmını **kendi Render URL'iniz** ile değiştirin!

#### 1.3 `.gitignore` Kontrol

`frontend/.gitignore` dosyasında `.env` dosyalarının **ignore edilmediğinden** emin olun (veya Vercel dashboard'dan env variables ekleyeceksiniz):

```gitignore
# Sadece .env.local ignore edilsin
.env.local
.env*.local
```

**Önerilen Yöntem**: `.env.production` dosyasını commit etmek yerine, **Vercel dashboard**'dan environment variable eklemek.

---

### Adım 2: API Client Configuration

#### 2.1 `src/config/api.js` (Yeni Dosya)

**Dosya**: `frontend/src/config/api.js`

```javascript
// API Base URL - Vite environment variable'dan al
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  upload: `${API_BASE_URL}/api/upload`,
  files: `${API_BASE_URL}/api/files`,
  companies: `${API_BASE_URL}/api/companies`,
};

// Axios default config (eğer axios kullanıyorsanız)
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

#### 2.2 `vite.config.js` Güncelleme

**Dosya**: `frontend/vite.config.js`

```javascript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Environment variables'ı yükle
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        }
      } : undefined
    },
    // Environment variables'ı expose et
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    }
  }
})
```

**Değişiklikler**:
- ✅ `loadEnv` ile environment variables yükleniyor
- ✅ Proxy sadece development modunda aktif
- ✅ Production'da doğrudan backend URL'i kullanılacak

---

#### 2.3 Mevcut API Çağrılarını Güncelleme

Eğer kodunuzda `/api/...` şeklinde doğrudan fetch/axios çağrıları varsa, bunları güncelleyin:

**Önce** (Eski yöntem):
```javascript
fetch('/api/files')
```

**Sonra** (Yeni yöntem):
```javascript
import { API_BASE_URL } from './config/api';

fetch(`${API_BASE_URL}/api/files`)
```

**VEYA** (Axios ile):
```javascript
import axios from 'axios';
import { axiosConfig } from './config/api';

const api = axios.create(axiosConfig);

api.get('/api/files');  // Otomatik olarak baseURL ekler
```

---

### Adım 3: Vercel'de Deployment

#### 3.1 Vercel Dashboard

1. [vercel.com](https://vercel.com) → "Sign In with GitHub"
2. **"Add New..."** → **"Project"**
3. GitHub repository'nizi seçin ve **Import**

#### 3.2 Konfigürasyon

| Alan | Değer |
|------|-------|
| **Framework Preset** | `Vite` (otomatik algılanır) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (otomatik) |
| **Output Directory** | `dist` (otomatik) |
| **Install Command** | `npm install` (otomatik) |

#### 3.3 Environment Variables

Vercel dashboard'da **Environment Variables** sekmesine gidin:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://saka-qms-backend.onrender.com` | Production |

> [!TIP]
> **Environment** seçiminde **Production**, **Preview**, ve **Development** seçenekleri var. Sadece **Production** seçin.

#### 3.4 Deploy

- **"Deploy"** butonuna tıklayın
- Build log'ları izleyin (~1-2 dakika)
- Deploy tamamlandığında **Vercel URL'inizi** kopyalayın (örn: `https://saka-qms.vercel.app`)

#### 3.5 Test

Tarayıcınızda Vercel URL'inizi açın ve uygulamanızın çalıştığını kontrol edin.

---

## Deployment Sırası

### 🔄 Doğru Deployment Sırası

1. ✅ **Backend'i Render'a deploy et** → Backend URL'i al
2. ✅ **Frontend `.env.production` dosyasını güncelle** → Backend URL'i ekle
3. ✅ **Frontend'i Vercel'e deploy et** → Vercel URL'i al
4. ✅ **Backend CORS'u güncelle** → Vercel URL'i ekle
5. ✅ **Render'da re-deploy yap** (environment variable değiştiği için)
6. ✅ **Test et** → Vercel üzerinden API çağrılarının çalıştığını doğrula

### 📝 Detaylı Adımlar

#### 1️⃣ Backend Deployment
```bash
# GitHub'a push
git add backend/
git commit -m "Backend deployment hazırlığı"
git push origin main

# Render.com otomatik deploy edecek
```

**Backend URL**: `https://saka-qms-backend.onrender.com`

---

#### 2️⃣ Frontend Environment Variables

`frontend/.env.production`:
```env
VITE_API_URL=https://saka-qms-backend.onrender.com
```

```bash
git add frontend/.env.production
git commit -m "Production environment variables"
git push origin main
```

---

#### 3️⃣ Frontend Deployment

Vercel otomatik deploy edecek (GitHub push sonrası).

**Vercel URL**: `https://saka-qms.vercel.app`

---

#### 4️⃣ Backend CORS Güncelleme

Render Dashboard → Environment Variables:

**ALLOWED_ORIGINS** değerini güncelle:
```
http://localhost:5173,https://saka-qms.vercel.app
```

**Manuel Re-deploy**: Render dashboard → **"Manual Deploy"** → **"Deploy latest commit"**

---

#### 5️⃣ Final Test

Tarayıcı DevTools (F12) → **Network** tab:

1. Vercel URL'inizi açın: `https://saka-qms.vercel.app`
2. Bir API çağrısı yapın (örn: dosya listesi)
3. Network tab'da isteğin **200 OK** dönmesini kontrol edin
4. **CORS hatası olmamalı**

---

## Troubleshooting

### ❌ CORS Hatası

**Hata**:
```
Access to fetch at 'https://saka-qms-backend.onrender.com/api/files' 
from origin 'https://saka-qms.vercel.app' has been blocked by CORS policy
```

**Çözüm**:
1. Render Dashboard → Environment Variables
2. `ALLOWED_ORIGINS` değerine Vercel URL'inizi ekleyin:
   ```
   http://localhost:5173,https://saka-qms.vercel.app
   ```
3. Manual re-deploy yapın

---

### ❌ Backend 503 Error (Ilk İstekte)

**Hata**:
```
503 Service Unavailable
```

**Açıklama**: Render.com ücretsiz plan 15 dakika kullanılmazsa uyur, ilk istek ~30 saniye gecikmeli olabilir.

**Çözüm**: Normal bir durum, 30 saniye bekleyin ve tekrar deneyin.

---

### ❌ Environment Variables Tanınmıyor

**Hata**: `import.meta.env.VITE_API_URL` undefined

**Çözüm**:
1. **Vercel**: Environment variables ekledikten sonra **re-deploy** yapın
2. **Local**: `.env` dosyası `frontend/` klasöründe olmalı
3. Environment variable adı **VITE_** prefix'i ile başlamalı

---

### ❌ Build Hatası (Vercel)

**Hata**: `Module not found` veya `import error`

**Çözüm**:
1. `package.json` dependencies kontrol edin
2. `npm install` çalıştırıp `package-lock.json` güncelleyin
3. Commit ve push yapın

---

### ❌ File Upload Çalışmıyor

**Muhtemel Sebep**: Render.com ücretsiz planda **ephemeral file system** kullanır, yüklenen dosyalar restart sonrası silinir.

**Çözüm**:
1. **Cloud Storage kullanın**: AWS S3, Cloudinary, veya Render Disk (ücretli)
2. **Alternatif**: Supabase Storage (ücretsiz 1GB)

---

## 🎉 Tebrikler!

Projeniz artık tamamen ücretsiz ve kalıcı olarak yayında!

- **Frontend**: `https://saka-qms.vercel.app`
- **Backend**: `https://saka-qms-backend.onrender.com`

### 🔄 Gelecekteki Güncellemeler

Her GitHub push otomatik deployment tetikler:
- Vercel: Instant deployment (~1-2 dakika)
- Render: Auto-deployment (~2-3 dakika)

### 📊 Monitoring

- **Vercel**: Dashboard'dan deployment logs, analytics
- **Render**: Dashboard'dan logs, metrics, health checks

### 💰 Ücretli Planlara Geçiş (Opsiyonel)

Eğer ileride ihtiyaç duyarsanız:
- **Render**: $7/ay (Always on, no sleep)
- **Vercel**: Free plan çoğu proje için yeterli

---

## 🆘 Yardım

Sorun yaşarsanız:
1. Render logs: Dashboard → Logs tab
2. Vercel logs: Dashboard → Deployments → Log output
3. Browser DevTools: Console ve Network tab

