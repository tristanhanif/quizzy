# FILE: frontend.prd
# TITLE: Frontend Architecture & Client Specification
# VERSION: 1.0.0
# TECH_STACK: Next.js (App Router), Tailwind CSS, Zustand, Socket.io-client, React Query

---

## 1. PROJECT_STRUCTURE (App Router)
src/
├── app/
│   ├── (auth)/         # Login, Register
│   ├── (dashboard)/    # Layouts for Admin, Creator, Participant
│   ├── quiz/           # Live Quiz Arena (SPA Mode)
│   └── layout.tsx
├── components/         # Reusable UI (Button, Input, Timer)
├── hooks/              # useSocket, useQuiz, useAuth
├── store/              # Zustand (QuizStore, AuthStore)
├── services/           # Axios instance, API endpoints
└── utils/              # Time formatters, Socket helpers

---

## 2. STATE_MANAGEMENT_STRATEGY
- AuthContext: Menyimpan session token & user profile (Persisted via Cookies).
- Zustand Store (QuizStore): 
  - `activeQuiz`: Data soal & sesi.
  - `quizState`: Current index, scores, timer.
  - `leaderboard`: Data ranking terkini.
- React Query: Fetching data kuis dan riwayat hasil (caching mechanism).

---

## 3. CORE_UI_FLOW
- Dashboard: Role-based view.
- QuizArena: 
  - No Layout-Shift (Fullscreen mode).
  - Countdown logic (Local countdown based on server-provided `endTime`).
  - Real-time feedback UI (Conditional rendering for correct/wrong animation).
- LeaderboardView: Dynamic ranking table with sorting.

---

## 4. SOCKET_CLIENT_INTEGRATION
- Hook `useSocket`: 
  - Auto-reconnect logic.
  - Namespace handling: `/host` vs `/participant`.
  - Event listeners: `quiz_started`, `leaderboard_update`, `quiz_finished`.

---

## 5. ROUTING_PROTECTION
- Middleware: 
  - Check JWT existence before accessing `/dashboard` or `/quiz`.
  - Redirect unauthorized users to `/login`.
  - Role-based routing: Admin/Creator routes cannot be accessed by Participant.

---

## 6. DEVELOPMENT_GUIDELINES
- Styling: Tailwind CSS (Mobile-first, responsive grid).
- Data Fetching: Axios with Interceptors (auto-attach JWT).
- Performance: Memoization on heavy components (e.g., Leaderboard table).
- SPA Logic: Use `router.push()` for navigation within the Quiz session to prevent full page reloads.