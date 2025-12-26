# Vercel Permission Denied Hatası Çözümü

## ❌ Hata
```
sh: line 1: /vercel/path0/frontend/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

## 🔍 Sebep
Vercel'in build environment'ında `vite` binary'sinin execute permission'ı yok.

## ✅ Çözüm 1: Vercel'de Clear Cache and Deploy (BASIT)

1. **Vercel Dashboard** → Projeniz → **Deployments**
2. **⋯** (3 nokta) → **Redeploy**
3. **"Clear Build Cache"** checkbox'ını **IŞARETLE**
4. **Redeploy** butonuna tıkla

Bu node_modules'ü temiz kuracak.

---

## ✅ Çözüm 2: package-lock.json Yenileme (LOKAL)

```bash
cd "C:\Users\Duran Ozcelik\Desktop\SAKA QMS\frontend"

# node_modules ve package-lock.json sil
rm -rf node_modules package-lock.json

# Temiz install
npm install

# Git'e commit et
git add package-lock.json
git commit -m "package-lock.json yenilendi"
git push origin main
```

Vercel otomatik deploy edecek.

---

## ✅ Çözüm 3: Vite Versiyonu Güncelle

Daha yeni Vite versiyonu bu sorunu çözebilir.

`frontend/package.json`:
```json
{
  "devDependencies": {
    "vite": "^6.0.5"  // En son stable version
  }
}
```

Sonra:
```bash
cd frontend
npm update vite
git add package.json package-lock.json
git commit -m "Vite güncellendi"
git push origin main
```

---

## 🎯 ÖNERİLEN YÖNTEM

**En kolay:** Çözüm 1 (Vercel Clear Cache)

1. Deployments → ⋯ → Redeploy
2. ☑ Clear Build Cache
3. Redeploy

Bu %90 çözer!
