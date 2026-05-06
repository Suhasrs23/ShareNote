# 📝 ShareNote

ShareNote is a private, collaborative platform designed for small groups to organize and store shared links and notes. Built with modern web technologies, it provides a messaging-style interface for topic-organized collaboration.

## ✨ Key Features

- **Topic-based Rooms**: Create and join dedicated rooms to keep your links and notes organized by project, interest, or team.
- **Rich Link Previews**: Automated OpenGraph previews for shared URLs, including titles, descriptions, and images.
- **Owner-Approval System**: Secure room management where owners approve join requests to maintain privacy.
- **Collaborative Editor**: Real-time messaging-style interface powered by Tiptap for seamless note-taking.
- **User Profiles**: Personalized experience with custom display names and avatars.
- **Responsive Design**: A premium, dark-mode-first aesthetic that works across all devices.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com)
- **Editor**: [Tiptap](https://tiptap.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Scraping**: [Cheerio](https://cheerio.js.org/) for link metadata extraction

## 🛠️ Getting Started

### Prerequisites

1.  Create a [Supabase](https://supabase.com/) account and project.
2.  Enable Email or Google authentication in your Supabase dashboard.

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Suhasrs23/ShareNote.git
    cd ShareNote
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Rename `.env.example` to `.env.local` and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
    ```

4.  **Database Initialization:**
    Run the SQL scripts located in the `supabase/` directory within your Supabase SQL Editor in the following order:
    1. `schema.sql` (Base tables and policies)
    2. `room_management.sql` (Room logic and updates)
    3. `approvals_schema.sql` (Join requests and approval logic)

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🛡️ Security

ShareNote implements strict Row Level Security (RLS) policies in Supabase to ensure that:
- Users can only access rooms they are members of.
- Room settings and member approvals are restricted to room owners.
- Profiles are protected but visible to other room members.

## 📄 License

This project is licensed under the MIT License.

