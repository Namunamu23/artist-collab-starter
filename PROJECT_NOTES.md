# ArtistCollab Starter (Next.js 14 + Tailwind + TS)

A minimal, elegant MVP scaffold for an artist collaboration platform.

## Features
- App Router, dark UI, Tailwind utilities
- Landing + Explore + Artist profile
- Projects (brief, chat, tasks, agreement chips)
- Auth pages (stubs) + Supabase client wiring
- Ready to hook up PostHog, RLS, storage, and real data

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev
# open http://localhost:3000
```
> To connect Supabase: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Next Steps
- Replace mock data with Supabase tables
- Build file uploads (watermarked previews) with Supabase Storage or UploadThing
- Add licensing templates + publish Case Study pages
- Instrument analytics (PostHog)
