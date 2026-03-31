# SPEC.md — ShareNote Project Specification

> **Status**: `FINALIZED`

## Vision

A mobile-first web app where small, closed groups (like a WhatsApp friend group) can save and revisit interesting content they find online — blogs, reels, tweets, LinkedIn posts — without it getting buried in a chat. Content is organized into Rooms (for each group) and Topics (categories within a room), stored with rich-linked notes, and attributed by who shared it and when.

## Goals

1. Provide a persistent, organized "shared notepad" for friend groups to store links and notes they find online.
2. Organize content into user-created Topic categories within a Room so items never get lost.
3. Let users add context to links (like Slack's hyperlink-in-text format) instead of pasting a raw URL.
4. Keep each Room private — only members can see its content.

## Non-Goals (Out of Scope)

- Native iOS/Android app (PWA / mobile-first web is sufficient)
- Public discovery of rooms (no open search or marketplace)
- Real-time chat inside rooms (this is a notepad, not a messaging app)
- File or image upload attachments (links and text only, v1)
- AI summarization of links (future consideration)

## Users

**Primary**: Small friend groups (2–10 people) who regularly share content on WhatsApp/Instagram/Twitter and want a searchable, persistent place to store it.

**How they use it**:
- Open a link in browser or receive one in chat → come to ShareNote → paste it under the relevant Room & Topic
- Write a short note with the link embedded in text (e.g., "Great intro to transformers [read here](url)")
- Revisit topics later to find what was shared

## Constraints

- **Platform**: Mobile-first progressive web app (responsive HTML/CSS/JS). Must be usable via phone browser.
- **Auth**: Google OAuth (login with Gmail). No custom username/password.
- **Privacy**: Rooms are private by invite-link only. No public search.
- **v1 Scope**: Web app, links + rich text notes only. No native mobile features.

## Success Criteria

- [ ] A user can create a Room, invite friends via a shareable link, and have a private shared space.
- [ ] Users can create custom Topics within a Room (e.g., "ML", "Next Company Resources").
- [ ] Users can add an entry with embedded hyperlinked text (like Slack inline links).
- [ ] Every entry shows: who shared it, when it was shared, and which topic it belongs to.
- [ ] Only room members can view the room's content after Google login.
- [ ] The UI is clean, mobile-friendly, and fast.
