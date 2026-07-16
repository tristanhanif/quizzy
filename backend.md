# FILE: backend.md
# TITLE: Backend Architecture & API Specification
# VERSION: 1.1.0 (Google Auth & Role-based Onboarding Added)
# TECH_STACK: NestJS, Firebase Admin SDK, Socket.IO, JWT

---

## 1. MODULES_ARCHITECTURE
src/
├── auth/           # JWT, Guards, Login/Register/Google-Link
├── quizzes/        # Bank Soal, CRUD Quizzes
├── sessions/       # Room Management, Pin Generation
├── results/        # Leaderboard calculation, History
├── gateway/        # Socket.IO Event Handlers (/host, /participant)
├── common/         # Decorators, Interceptors, Filters
└── firebase/       # Admin SDK Initializer & Repository Wrapper

---

## 2. DATABASE_SCHEMA_MAP
- users/            (userId) 
    - email (Unique), role (null|'CREATOR'|'PARTICIPANT'), provider ('manual'|'google'), isLinked (boolean)
- quizzes/          (quizId)
- quiz_sessions/    (sessionId)
- quiz_results/     (resultId)

---

## 3. API_CONTRACTS
### AUTH
- POST /auth/register      -> {fullName, email, password, role}
- POST /auth/login         -> {accessToken, user, role}
- POST /auth/google-login  -> {idToken} -> {accessToken, user, needsRoleSelection: boolean}
- POST /auth/set-role      -> {role}    -> {success: boolean} (Required if needsRoleSelection is true)

### QUIZZES
- GET /quizzes             -> {data: Quiz[]}
- POST /quizzes            -> {id, message}

### SESSIONS
- POST /sessions           -> {sessionId, roomCode}
- POST /sessions/join      -> {isValid, sessionId, websocketUrl}

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
- **Role-based Access Control:** If `user.role` is null, access is restricted to `/auth/set-role` only.
- Firestore Rules:
  - Users can read/write their own profiles.
  - `allow update: if request.resource.data.role != resource.data.role && resource.data.role == null`: Prevent role tampering after set.

---

## 6. IMPLEMENTATION_ORDER
1. Update User Firestore Schema (Add `role`, `provider`, `isLinked`).
2. Implement Firebase Admin Google Token Verification.
3. Auth Flow: Logic to merge Google Account with existing Email.
4. Implement `/auth/set-role` endpoint.
5. Frontend: Onboarding flow (Role selection UI).