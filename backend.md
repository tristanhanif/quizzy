# FILE: backend.prd
# TITLE: Backend Architecture & API Specification
# VERSION: 1.0.0
# TECH_STACK: NestJS, Firebase Admin SDK, Socket.IO, JWT

---

## 1. MODULES_ARCHITECTURE
src/
├── auth/           # JWT, Guards, Login/Register
├── quizzes/        # Bank Soal, CRUD Quizzes
├── sessions/       # Room Management, Pin Generation
├── results/        # Leaderboard calculation, History
├── gateway/        # Socket.IO Event Handlers (/host, /participant)
├── common/         # Decorators, Interceptors, Filters
└── firebase/       # Admin SDK Initializer & Repository Wrapper

---

## 2. DATABASE_SCHEMA_MAP
- users/              (userId)
- quizzes/            (quizId) - questions: []
- quiz_sessions/      (sessionId)
  - participants/     (sub-collection: userId)
- quiz_results/       (resultId)

---

## 3. API_CONTRACTS
# AUTH
POST /auth/register   -> {fullName, email, password, role}
POST /auth/login      -> {accessToken, user: {id, name, role}}

# QUIZZES
GET /quizzes          -> {data: Quiz[]}
POST /quizzes         -> {id, message}

# SESSIONS
POST /sessions        -> {sessionId, roomCode}
POST /sessions/join   -> {isValid, sessionId, websocketUrl}

---

## 4. WEBSOCKET_EVENT_MAP
NAMESPACE: /host
- start_quiz(roomCode)
- next_question(roomCode)
- end_quiz(roomCode)

NAMESPACE: /participant
- join_room(roomCode, userId)
- submit_answer(questionId, answer)
- reconnect(roomCode, userId)

---

## 5. SECURITY_RULES_GUIDELINES
- Auth required for all endpoints (JWT Guard).
- Role-based Access Control (Roles: ADMIN, CREATOR, PARTICIPANT).
- Firestore Rules:
  - Users can read/write their own profiles.
  - Creator can read/write their own quizzes.
  - Participants only read active session/question state.

---

## 6. IMPLEMENTATION_ORDER
1. DTOs & Validation Schemas
2. Firebase Repository Setup
3. REST API Controllers
4. WebSocket Gateways
5. Security Guards & Interceptors