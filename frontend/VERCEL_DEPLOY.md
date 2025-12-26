# 🚀 Vercel'e Deploy Rehberi

Bu doküman, SAKA QMS Frontend uygulamasını Vercel'e deploy etmek için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

1. **GitHub Hesabı**: Projeniz GitHub'da olmalı
2. **Vercel Hesabı**: [vercel.com](https://vercel.com) üzerinden ücretsiz hesap oluşturun
3. **Backend URL**: Render.com'da deploy edilmiş backend URL'iniz hazır olmalı

## 🔧 Deploy Adımları

### 1️⃣ GitHub'a Kod Gönderme

Eğer henüz yapmadıysanız, projenizi GitHub'a push edin:

```bash
git add .
git commit -m "Vercel deployment hazırlığı"
git push origin main
```

### 2️⃣ Vercel'de Proje Oluşturma

1. [vercel.com](https://vercel.com) adresine gidin ve GitHub ile giriş yapın
2. **"Add New Project"** butonuna tıklayın
3. GitHub repository'nizi seçin (SAKA QMS)
4. **"Import"** butonuna tıklayın

### 3️⃣ Proje Ayarları

Vercel'de proje ayarlarını yapın:

#### Framework Preset
- **Framework Preset**: Vite

#### Root Directory
- **Root Directory**: `frontend` (eğer mono-repo kullanıyorsanız)
- Eğer sadece frontend klasörünü deploy ediyorsanız, root directory olarak bunu belirtin

#### Build Settings
- **Build Command**: `npm run build` (otomatik gelecek)
- **Output Directory**: `dist` (otomatik gelecek)
- **Install Command**: `npm install` (otomatik gelecek)

### 4️⃣ Environment Variables (Çok Önemli! ⚠️)

**Settings > Environment Variables** kısmından şu değişkeni ekleyin:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://saka-qms-backend.onrender.com` | Production |

> ⚠️ **DİKKAT**: Backend URL'inizi kendi Render.com URL'iniz ile değiştirin!

**Not**: Backend URL'iniz sonunda `/` (slash) olmamalı!

### 5️⃣ Deploy!

1. **"Deploy"** butonuna tıklayın
2. Vercel otomatik olarak build işlemini başlatacak
3. 1-2 dakika içinde deploy tamamlanacak

## ✅ Deploy Sonrası

### Domain Ayarları

Vercel size otomatik olarak bir domain verir:
- `https://your-project-name.vercel.app`

**Custom domain** eklemek isterseniz:
1. **Settings > Domains** bölümüne gidin
2. Kendi domain'inizi ekleyin
3. DNS ayarlarını yapın

### Backend CORS Ayarları

Backend'inizde CORS ayarlarına Vercel domain'inizi eklemeyi unutmayın!

`backend/main.py` dosyasında:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project-name.vercel.app",  # Vercel URL'inizi ekleyin
        "http://localhost:5173"  # Development için
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔄 Otomatik Deploy

Vercel otomatik deploy özelliği ile:
- GitHub'a her `git push` yaptığınızda
- Vercel otomatik olarak yeni versiyonu deploy eder
- Ana branch (main/master) için production
- Diğer branch'ler için preview URL'ler oluşturur

## 🐛 Sorun Giderme

### Build Hatası Alıyorsanız

1. **Logs'u kontrol edin**: Vercel dashboard'da build logs'ları inceleyin
2. **Local'de test edin**: `npm run build` komutunu local'de çalıştırın
3. **Node version**: Vercel'de Node.js versiyonu `package.json`'dan okunur

### API Bağlantı Hatası

1. **CORS ayarları**: Backend'de CORS yapılandırmasını kontrol edin
2. **Environment Variables**: `VITE_API_URL` doğru set edilmiş mi?
3. **Backend durumu**: Render.com'da backend çalışıyor mu?

### Sayfa Yenileme 404 Hatası

`vercel.json` dosyasındaki `rewrites` ayarı bu sorunu çözer. Eğer sorun devam ediyorsa:
- `vercel.json` dosyasının doğru konumda olduğunu kontrol edin
- Yeniden deploy edin

## 📊 Monitoring

Vercel dashboard'dan şunları izleyebilirsiniz:
- **Analytics**: Kullanıcı trafiği
- **Speed Insights**: Performans metrikleri  
- **Logs**: Runtime ve build logları
- **Deployments**: Geçmiş deploy'lar

## 💡 İpuçları

1. **Preview Deployments**: Her branch için otomatik preview URL'ler
2. **Environment Variables**: Development, Preview ve Production için farklı değerler set edebilirsiniz
3. **Rollback**: Önceki deploy'lara tek tıkla geri dönebilirsiniz
4. **Free Tier Limits**: 
   - 100 GB bandwidth/ay
   - Sınırsız deploy
   - Otomatik HTTPS

## 🎉 Başarılı Deploy!

Deploy başarılı olduktan sonra, uygulamanız şu adreste canlı olacak:
`https://your-project-name.vercel.app`

---

**Yardım için**: [Vercel Documentation](https://vercel.com/docs)
