# Product Workers Supabase App

Next.js app for products, workers, counters and reports.

## Local start

1. Copy `.env.example` to `.env.local`
2. Insert your Supabase URL and anon key
3. Run:

```bash
npm install
npm run dev
```

## Production deploy

- Push to GitHub
- Import the repo into Vercel
- Add the same environment variables in Vercel Project Settings
- Deploy


## Environment variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

For older Supabase projects you can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead.
