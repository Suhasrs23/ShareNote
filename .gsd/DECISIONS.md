# DECISIONS.md — Architecture Decision Records

> Log of key technical and product decisions made during the project.

---

## ADR-001: Mobile-First Web App over Native App
**Date**: 2026-03-31
**Decision**: Build a Progressive Web App (PWA) using Next.js, not a native iOS/Android app.
**Reason**: Faster to build, shareable via browser, can be added to home screen. Native app can come later.

---

## ADR-002: Google OAuth via Supabase
**Date**: 2026-03-31
**Decision**: Use Supabase Auth with Google as the provider.
**Reason**: User requested "login with Gmail". Supabase makes this trivially easy and also provides the DB.

---

## ADR-003: Invite-Link Rooms (No Password)
**Date**: 2026-03-31
**Decision**: Rooms are joined via a unique invite link — no passwords or approval flow in v1.
**Reason**: Simpler UX, mimics WhatsApp group invite behavior that users are already familiar with.

---

## ADR-004: Tiptap for Rich Text Editor
**Date**: 2026-03-31
**Decision**: Use Tiptap as the rich text editor for entries.
**Reason**: Supports inline hyperlinks (Slack-style text + URL) without heavy overhead. Headless and customizable.
