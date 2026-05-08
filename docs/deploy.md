# Deploy Notları

## Firebase

1. Firebase Console'da yeni bir proje oluştur.
2. Authentication bölümünde Anonymous sign-in'i aç.
3. Firestore Database oluştur.
4. Storage oluştur.
5. Web app ekleyip config değerlerini `.env` veya Vercel Environment Variables içine gir.
6. `firebase.rules` içeriğini Firestore Rules'a, `storage.rules` içeriğini Storage Rules'a uygula.

## Vercel

1. Repoyu Vercel'e bağla.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_APP_ID`

Firebase değerleri girilmezse site demo/local modda çalışır; notlar ve fotoğraflar yalnızca ilgili tarayıcıda kalır.
