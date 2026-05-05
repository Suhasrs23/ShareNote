# STATE.md — Project State

> **Last Updated**: 2026-05-05
> **Current Phase**: Phase 4 — Polish, Search & PWA
> **Active Work**: Phase 4 Kickoff

## Current Position
- **Phase**: 4
- **Task**: Entry Search & Edit/Delete
- **Status**: Starting execution

## Plans Created
- `.gsd/phases/1/1-PLAN.md` — Scaffold + DB Schema (wave 1)
- `.gsd/phases/1/2-PLAN.md` — Google OAuth + Auth Home Page (wave 2)

## Next Steps
1. Implement full-text search for entries within a room.
2. Add Edit and Delete functionality for a user's own entries.
3. Configure PWA manifest and service worker for mobile installability.

## Key Decisions Made
- Mobile-first web app (no native app)
- Rooms are private, invite-link only
- Google OAuth for login via Supabase Auth
- Topics are user-created inside each Room
- Rich text entries with inline hyperlinks (Slack-style via Tiptap)
- Tech stack: Next.js (App Router) + Supabase + Tiptap + Vercel
- Using official `with-supabase` template for best-practice SSR auth setup
