# ROADMAP.md — ShareNote

> **Current Phase**: Not started
> **Milestone**: v1.0 — Private Shared Notepad MVP

## Must-Haves (from SPEC)

- [ ] Google OAuth login
- [ ] Create and join Rooms (invite-link based)
- [ ] Create Topics inside a Room
- [ ] Add entries with rich-linked text (Slack-style inline hyperlinks)
- [ ] Show: who shared, when shared, which topic
- [ ] Private rooms — members only

---

## Phases

### Phase 1: Foundation & Auth
**Status**: ⬜ Not Started
**Objective**: Scaffold the project, set up database, and implement Google OAuth login. Users can log in/out and see their identity.
**Deliverables**:
- Next.js project (mobile-first, App Router)
- Supabase DB + schema (users, rooms, topics, entries, room_members)
- Google OAuth via Supabase Auth
- Authenticated landing page with user profile display

---

### Phase 2: Rooms & Membership
**Status**: ⬜ Not Started
**Objective**: Users can create Rooms, get a shareable invite link, and others can join using that link.
**Deliverables**:
- Create Room flow (name + optional description)
- Unique invite link generation per room
- Join via invite link (auto-adds member after login)
- Room list on home screen (My Rooms)
- Room membership guard (unauthorized users blocked)

---

### Phase 3: Topics & Entries
**Status**: ⬜ Not Started
**Objective**: Inside a Room, users can create Topics and add rich-linked notes/entries under each Topic.
**Deliverables**:
- Topic creation (custom name, emoji/icon optional)
- Entry creation with rich text editor supporting Slack-style inline hyperlinks
- Entry metadata: author avatar/name, timestamp
- Topic view: all entries grouped under that topic
- Quick topic switcher (tab bar or sidebar)

---

### Phase 4: Polish, Search & PWA
**Status**: ⬜ Not Started
**Objective**: Make it feel like a real app. Add search, mobile PWA install prompt, and polish the UI.
**Deliverables**:
- Full-text search across entries in a room
- PWA manifest + service worker (Add to Home Screen)
- Mobile-first UI polish (smooth transitions, mobile nav, dark mode)
- Edit + delete own entries
- Share entry (copy link to entry)

---

## Tech Stack (Proposed)

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) | Full-stack, SSR, easy deploy |
| Styling | Tailwind CSS | Rapid mobile-first UI |
| Database | Supabase (Postgres) | Auth + DB + realtime in one |
| Auth | Supabase Google OAuth | Easiest Google login flow |
| Rich Text | Tiptap (lightweight) | Inline link embedding like Slack |
| Deploy | Vercel | Zero-config Next.js hosting |
