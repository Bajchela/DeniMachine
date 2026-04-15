# Publish koraci: GitHub + Supabase + Vercel

## 1) GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TVOJ_USERNAME/product-workers-supabase-app.git
git push -u origin main
```

## 2) Supabase

1. Napravi projekat.
2. Otvori **SQL Editor**.
3. Nalepi sadržaj fajla `supabase-schema.sql`.
4. Klikni **Run**.
5. Otvori **Project Settings > API**.
6. Kopiraj:
   - Project URL
   - anon public key
7. Stavi ih u `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) Lokalni test

```bash
npm install
npm run dev
```

Aplikacija radi na `http://localhost:3000`.

## 4) Vercel

1. Uloguj se preko GitHub naloga.
2. Klikni **Add New Project**.
3. Izaberi repo `product-workers-supabase-app`.
4. Framework će Vercel sam prepoznati kao Next.js.
5. U **Environment Variables** dodaj iste dve vrednosti:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Klikni **Deploy**.

Posle toga dobiješ adresu tipa:

`https://product-workers-supabase-app.vercel.app`
