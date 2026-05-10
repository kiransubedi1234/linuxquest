# 🐧 LinuxQuest — Duolingo for the Linux Terminal

> Master the Linux terminal through interactive, gamified lessons. Earn XP, maintain streaks, and advance through 5 skill units.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎮 Gamification | XP (+10/step, +50/quiz pass), streaks, 5 hearts |
| 🖥️ Real Terminal | Virtual filesystem, real Linux error messages, command history |
| 📚 5 Units | Absolute Zero → Beginner → Intermediate → Intermediate+ → Advanced |
| 📝 Unit Quizzes | 5 questions, ≥70% to pass, +50 XP reward |
| 🔐 Auth | Google Sign-In (Firebase) + Guest mode |
| 🔄 Sync | localStorage (instant) + Firestore (debounced 2s) |
| 📶 Offline | Queue actions → flush on reconnect |
| 🎉 Celebrations | Confetti on lesson/quiz/unit completion |

---

## 📁 Project Structure

```
linuxquest/
├── apps/web/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                # Routes & layouts
│   │   │   ├── layout.tsx      # Root layout + metadata
│   │   │   ├── page.tsx        # Auth-aware redirect
│   │   │   ├── login/          # Google + Guest sign-in
│   │   │   └── learn/          # Learning path
│   │   │       ├── page.tsx    # Unit map
│   │   │       └── [unitId]/
│   │   │           ├── page.tsx        # Lesson list
│   │   │           ├── quiz/page.tsx   # Unit quiz
│   │   │           └── [lessonId]/page.tsx  # Active lesson
│   │   ├── components/         # UI components
│   │   │   ├── Terminal.tsx    # Interactive bash terminal
│   │   │   ├── Sidebar.tsx     # XP, streak, hearts
│   │   │   ├── QuizModal.tsx   # Unit quiz modal
│   │   │   ├── ProgressBar.tsx # Animated progress
│   │   │   ├── CelebrationOverlay.tsx  # Confetti!
│   │   │   ├── HeartDisplay.tsx
│   │   │   └── UnitCard.tsx
│   │   ├── lib/
│   │   │   ├── firebase.ts     # Auth + Firestore init
│   │   │   ├── commandParser.ts # Mock bash + error messages
│   │   │   ├── validators.ts   # Zod schemas + merge logic
│   │   │   └── sync.ts         # Dual-sync implementation
│   │   ├── hooks/
│   │   │   ├── useAuth.ts      # Firebase auth state
│   │   │   ├── useSync.ts      # Progress sync hook
│   │   │   ├── useTerminal.ts  # Terminal state + VFS
│   │   │   └── useStreak.ts    # Streak logic
│   │   ├── types/index.ts      # All types + Zod schemas
│   │   └── data/curriculum.ts  # 5 units, 15+ lessons, quizzes
│   └── tests/
│       ├── commandParser.test.ts  # 35+ terminal tests
│       └── validators.test.ts     # Schema + merge tests
└── packages/config/            # Shared tsconfig, eslint, prettier
```

---

## 🚀 Quickstart

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Firebase project (for auth + Firestore)

### 1. Clone & Install

```bash
git clone <your-repo>
cd linuxquest
npm install
```

### 2. Configure Environment

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project → **Authentication** → Enable **Google** provider
3. **Firestore** → Create database → Start in **production mode**
4. Add Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Add your domain to **Authentication → Authorized domains**

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Run Tests

```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run typecheck           # TypeScript check
npm run lint                # ESLint
```

---

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
cd apps/web
vercel --prod
```

Set environment variables in the Vercel dashboard (same as `.env.local`).

### Option B: GitHub Integration

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Set **Root Directory** to `apps/web`
4. Add environment variables
5. Deploy!

### Post-Deploy

- Add your Vercel domain to Firebase **Authorized domains**
- Test Google Sign-In on the live URL

---

## 🎮 Gamification Logic

| Action | XP |
|---|---|
| Complete a lesson step | +10 XP |
| Complete a lesson | +20 XP bonus |
| Pass a unit quiz | +50 XP |
| Perfect quiz (100%) | +75 XP total |
| Daily streak | Maintained if active within 24h |

**Hearts**: Start with 5, lose 1 on wrong commands, max 5. Refill over time.

**Unit unlock**: XP thresholds — 0, 150, 400, 700, 1000 XP.

---

## 🖥️ Supported Terminal Commands

| Command | Description |
|---|---|
| `pwd` | Print working directory |
| `ls [-l] [-a]` | List directory contents |
| `cd <dir>` | Change directory |
| `mkdir <dir>` | Create directory |
| `touch <file>` | Create empty file |
| `cat <file>` | Show file contents |
| `cp <src> <dest>` | Copy file |
| `mv <src> <dest>` | Move/rename |
| `rm [-r] <path>` | Delete file/directory |
| `echo <text>` | Print text |
| `whoami` | Current user |
| `date` | Current date/time |
| `uname [-a]` | OS name |
| `man <cmd>` | Command manual |
| `clear` | Clear screen |
| `help` | Show all commands |

Error messages match real Linux bash output exactly.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Tests cover:
- All 15 terminal commands + error cases
- Zod schema validation
- Progress merge/conflict resolution
- Edge cases (empty input, typos, directories vs files)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore |
| Offline | IndexedDB persistence + localStorage queue |
| Validation | Zod |
| Animation | canvas-confetti + CSS keyframes |
| Testing | Jest + ts-jest |
| Fonts | Inter + JetBrains Mono |

---

## 📄 License

MIT — feel free to learn, fork, and build on it!
