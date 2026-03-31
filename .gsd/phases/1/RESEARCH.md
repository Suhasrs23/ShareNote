# RESEARCH.md — Phase 1: Foundation & Auth

## Summary

Key findings for scaffolding Next.js + Supabase + Google OAuth.

---

## Next.js Scaffolding

- Use official Supabase template: `npx create-next-app@latest -e with-supabase ./`
- This bootstraps Next.js App Router + `@supabase/ssr` + middleware boilerplate automatically — the fastest correct starting point
- Includes: TypeScript, Tailwind CSS, App Router, Supabase SSR client utils, auth middleware

---

## Supabase Auth Setup

- Package: `@supabase/ssr` (NOT legacy `auth-helpers-nextjs`)
- Requires three client instances:
  - `lib/supabase/client.ts` — Browser (Client Components)
  - `lib/supabase/server.ts` — Server Components (cookie-based)
  - `middleware.ts` — Token refresh before route render
- Env vars needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Google OAuth Flow

1. Create Google Cloud project → enable OAuth 2.0 credentials
2. Add authorized redirect URIs:
   - Dev: `http://localhost:3000/auth/callback`
   - Prod: `https://<project-id>.supabase.co/auth/v1/callback`
3. In Supabase Dashboard: Authentication > Providers > Google → paste Client ID + Secret
4. In app: `supabase.auth.signInWithOAuth({ provider: 'google' })`

---

## Database Schema (Phase 1 scope)

Tables needed (will be created via Supabase SQL editor):
- `profiles` — linked to `auth.users`, stores display_name, avatar_url
- `rooms` — id, name, description, invite_code (UUID), created_by, created_at
- `room_members` — room_id, user_id, joined_at, role (owner/member)
- `topics` — id, room_id, name, emoji, created_by, created_at
- `entries` — id, topic_id, room_id, content (JSON rich text), created_by, created_at

---

## Key Risks

- Google OAuth redirect URI mismatch is the most common setup error → must verify exact URL match
- `with-supabase` template requires Supabase project to exist before running dev server (needs .env.local)
