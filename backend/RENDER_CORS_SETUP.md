# 🔐 Render.com CORS ve Environment Variable Kurulum Rehberi

Bu rehber, Render.com'da backend servisinize **ALLOWED_ORIGINS** environment variable'ını nasıl ekleyeceğinizi adım adım açıklar.

## ⚠️ Neden Gerekli?

Backend'iniz CORS (Cross-Origin Resource Sharing) kullanarak hangi domain'lerden gelen isteklere izin vereceğini kontrol eder. Vercel'de deploy edilen frontend'inizin backend'inize dosya yükleyebilmesi için Vercel URL'inizi CORS izin listesine eklemeniz gerekir.

**Eklenmezse**: 405 Method Not Allowed veya CORS hatası alırsınız.

## 📋 Adım Adım Kurulum

### 1️⃣ Render Dashboard'a Giriş

1. [dashboard.render.com](https://dashboard.render.com) adresine gidin
2. GitHub hesabınız ile giriş yapın

### 2️⃣ Backend Servisinizi Seçin

1. Dashboard'da **Web Services** listesinden backend projenizi seçin
   - Örnek: `saka-qms-backend` veya benzeri
2. Servisin detay sayfasına gidin

### 3️⃣ Environment Variables Bölümüne Gidin

1. Sol menüden **"Environment"** sekmesine tıklayın
2. **"Add Environment Variable"** butonuna tıklayın

### 4️⃣ ALLOWED_ORIGINS Variable'ını Ekleyin

Yeni environment variable ekleyin:

| Field | Value |
|-------|-------|
| **Key** | `ALLOWED_ORIGINS` |
| **Value** | `https://your-app.vercel.app,http://localhost:5173` |

#### ⚠️ ÖNEMLİ NOTLAR:

1. **Vercel URL'inizi değiştirin**: `https://your-app.vercel.app` yerine kendi Vercel domain'inizi yazın
   - Örnek: `https://saka-qms-duranozcelk.vercel.app`
   
2. **Virgülle ayırın**: Birden fazla URL eklerken aralarına `,` (virgül) koyun
   - ✅ Doğru: `https://app.vercel.app,http://localhost:5173`
   - ❌ Yanlış: `https://app.vercel.app http://localhost:5173`

3. **Boşluk bırakmayın**: Virgüllerden sonra boşluk bırakmayın
   - ✅ Doğru: `url1,url2,url3`
   - ❌ Yanlış: `url1, url2, url3`

4. **http/https dikkat edin**: Protokolü (http/https) tam olarak yazın
   - Vercel: `https://...` (her zaman HTTPS)
   - Localhost: `http://...` (genelde HTTP)

#### 📝 Örnek Değerler:

**Sadece production:**
```
https://saka-qms.vercel.app
```

**Production + localhost (önerilen):**
```
https://saka-qms.vercel.app,http://localhost:5173
```

**Birden fazla domain:**
```
https://saka-qms.vercel.app,https://custom-domain.com,http://localhost:5173
```

**Tüm domainlere izin ver (GÜVENLİ DEĞİL - sadece test için):**
```
*
```

### 5️⃣ Kaydet ve Redeploy

1. **"Add"** veya **"Save Changes"** butonuna tıklayın
2. Render **otomatik olarak backend'inizi yeniden deploy edecek**
3. Deploy işlemi 2-3 dakika sürer
4. Deploy tamamlandıktan sonra değişiklikler aktif olur

## ✅ Doğrulama

Environment variable'ın doğru eklendiğini kontrol edin:

### Backend Loglarını Kontrol Edin

1. Render Dashboard → Backend servisiniz → **"Logs"** sekmesi
2. Son deploy loglarına bakın
3. Şu satırı arayın:
   ```
   🔐 CORS Configured - Allowed Origins: ['https://your-app.vercel.app', 'http://localhost:5173']
   ```
4. URL'lerin doğru göründüğünden emin olun

### Frontend'den Test Edin

1. Vercel'deki frontend uygulamanızı açın
2. **Browser DevTools** açın (F12 tuşu)
3. **Console** sekmesine gidin
4. Dosya yüklemeyi deneyin
5. Kontrol edin:
   - ✅ CORS hatası yoksa: Başarılı!
   - ❌ Hala CORS hatası varsa: URL'leri tekrar kontrol edin

## 🐛 Sorun Giderme

### 1. Hala 405 Hatası Alıyorum

**Çözüm**:
- Environment variable'ı doğru yazdığınızdan emin olun: `ALLOWED_ORIGINS` (büyük harfler)
- Vercel URL'inizde typo olmadığından emin olun
- Render'da yeni deploy tamamlanana kadar bekleyin (2-3 dk)
- Browser cache'ini temizleyin (Ctrl+Shift+R veya Cmd+Shift+R)

### 2. URL'imi Nasıl Bulurum?

**Vercel URL**:
1. [vercel.com/dashboard](https://vercel.com/dashboard) → Projeniz
2. **"Domains"** bölümüne bakın
3. Varsayılan domain: `https://your-project-name.vercel.app`

### 3. Preview Deployments İçin CORS

Vercel'de her branch için ayrı preview URL oluşur (örn: `https://your-app-git-feature-branch.vercel.app`)

**Seçenek 1**: Her preview URL'i manuel ekleyin
```
https://main.vercel.app,https://feature-branch.vercel.app
```

**Seçenek 2**: Wildcard kullanın (Dikkatli!)
```
*
```
> ⚠️ Wildcard production'da güvenlik riski oluşturabilir!

### 4. Environment Variable Görünmüyor

- Render Dashboard'da doğru servisi seçtiğinizden emin olun
- "Environment" sekmesinde değişiklikten sonra **otomatik deploy tetiklenir**
- Deploy loglarını kontrol edin

## 🔄 Deployment Sonrası

Backend deploy edildikten sonra:

1. ✅ Environment variable eklendi
2. ✅ Backend yeniden deploy edildi  
3. ✅ CORS logları doğru görünüyor
4. ✅ Frontend'den dosya yükleme çalışıyor

## 📞 Ek Kaynaklar

- [Render Environment Variables Docs](https://render.com/docs/environment-variables)
- [CORS Nedir?](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [FastAPI CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)

---

**Başarılar!** 🎉 Artık production uygulamanızda dosya yükleme çalışmalı.
