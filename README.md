# Anneler Günü Anı Sitesi

Merve ve minik prenses için hazırlanmış, fotoğraf ve sevgi notlarını Firebase üzerinde kalıcı tutan Vite + React web sitesi.

## Yerelde Çalıştırma

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Firebase Ayarları

`.env.example` dosyasını `.env` olarak kopyalayıp Firebase web app değerlerini gir:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
```

Firebase değerleri yoksa site local demo modda açılır; notlar ve fotoğraflar yalnızca o tarayıcıda saklanır.

## Deploy

Vercel için build command `npm run build`, output directory `dist` olmalı. Firebase güvenlik kuralları ve Vercel ortam değişkenleri için [docs/deploy.md](docs/deploy.md) dosyasına bak.
