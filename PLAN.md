Got it! Here is your **original plan updated** with:

1. ✅ **Developer resources integrated** into the relevant sprints
2. ✅ **User stories** added to every sprint

---

# 🀄 HànCards — Chinese Character Mastery App

## Comprehensive Design & Development Plan

---

## 1. Product Vision

**HànCards** is an intelligent Chinese character learning platform that goes far beyond simple flashcards. It leverages spaced repetition science, character decomposition, handwriting practice, and gamification to create a deeply engaging and effective learning experience. The app understands that Chinese characters are not just "words" — they are visual systems built from radicals, strokes, and semantic/phonetic components — and it teaches accordingly.

---

## 2. Core Design Philosophy

| Principle | Description |
|---|---|
| **Character-Aware** | Treats characters as decomposable structures (radicals, components, stroke order), not opaque symbols |
| **Science-Backed** | Uses SM-2 spaced repetition algorithm with adaptive difficulty |
| **Multi-Modal Learning** | Combines visual, auditory, kinesthetic (drawing), and contextual learning |
| **Gamified Progression** | XP, streaks, levels, achievements to sustain motivation |
| **Offline-First, Cloud-Synced** | Works without internet; syncs when available |

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React (Vite) + Tailwind CSS + shadcn/ui | Fast, modern, component-driven UI |
| **Backend** | Node.js + Express (or Fastify) | Lightweight, JS ecosystem consistency |
| **Database** | PostgreSQL (via Railway) | Relational data with JSON support for flexible fields |
| **ORM** | Prisma | Type-safe DB access, easy migrations |
| **Auth** | JWT + bcrypt (later OAuth) | Simple to start, extensible |
| **Deployment** | Railway (monorepo or two services) | Easy deploy, supports Postgres natively |
| **Dictionary Data** | [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) — Free community Chinese-English dictionary (~120K entries) with traditional/simplified, pinyin, definitions | [1] |
| **Stroke Order** | [Hanzi Writer](https://hanziwriter.org/) — Open-source JS library (10kb gzipped), 9,000+ characters, stroke animations & quiz mode. Data from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) | [2] |
| **Character Decomposition** | [CJK Decomposition Data](https://github.com/cjkvi/cjkvi-ids) / IDS sequences — maps characters to radical + component trees | |
| **Example Sentences** | [Tatoeba](https://tatoeba.org/) — Free, community-built corpus of translated sentences | |

---

## 4. Information Architecture

```
User
 ├── Decks (collections of cards)
 │    ├── Card
 │    │    ├── character (汉字)
 │    │    ├── pinyin
 │    │    ├── meaning(s)
 │    │    ├── example sentences
 │    │    ├── radical / components
 │    │    ├── stroke count & order data
 │    │    ├── audio pronunciation URL
 │    │    ├── tags / HSK level
 │    │    └── user notes / mnemonic
 │    └── ...
 ├── Review Schedule (SRS metadata per card)
 │    ├── ease factor
 │    ├── interval
 │    ├── next review date
 │    ├── repetition count
 │    └── lapse count
 ├── Stats / Progress
 │    ├── daily reviews
 │    ├── streak
 │    ├── XP / level
 │    └── accuracy history
 └── Settings / Preferences
```

---

## 5. UI / UX Design Overview

### 5.1 Layout & Navigation

- **Top bar**: Logo, streak counter 🔥, XP bar, user avatar
- **Side nav (desktop) / Bottom tab bar (mobile)**:
  - 🏠 **Dashboard** — today's summary, due reviews, quick actions
  - 📚 **Decks** — manage decks & cards
  - 🧠 **Study** — review session launcher
  - 📊 **Stats** — progress analytics
  - ⚙️ **Settings**

### 5.2 Color Palette & Theme

- Primary: Deep red (#C41E3A) — evokes Chinese aesthetic
- Accent: Gold (#D4A017)
- Background: Warm off-white (#FAF7F2) / Dark mode: Charcoal (#1A1A2E)
- Cards: White with subtle ink-wash (水墨) texture borders
- Typography: Clean sans-serif for UI; a calligraphic font option for character display

### 5.3 Key Screens (Wireframe Descriptions)

| Screen | Description |
|---|---|
| **Dashboard** | Greeting with streak fire, "X cards due today" CTA button, weekly heatmap, recent activity feed |
| **Deck List** | Grid of deck cards with cover color, card count, mastery %, last studied |
| **Card Editor** | Form with character input that auto-fetches pinyin/meaning/radical from dictionary API; fields for custom mnemonic, tags, example sentences |
| **Study Session** | Full-screen card with character displayed large; tap to reveal pinyin → meaning → example; self-rate buttons (Again / Hard / Good / Easy) |
| **Handwriting Mode** | Canvas area to draw the character from memory; stroke-order ghost guide option |
| **Stats Page** | Charts: reviews over time, accuracy trend, cards by mastery stage, time spent, forecast of upcoming reviews |

---

## 6. Feature Inventory (Prioritized)

### 🟢 Must Have (MVP)
1. User registration & login
2. Create / edit / delete decks
3. Add / edit / delete cards (manual entry)
4. Basic flashcard review (show front → reveal back)
5. Self-rating (Again / Hard / Good / Easy)
6. SM-2 spaced repetition scheduling
7. Dashboard with due card count

### 🟡 Should Have
8. Auto-fill card data from CC-CEDICT dictionary on character input
9. Pinyin tone coloring (Tone 1=red, 2=orange, 3=green, 4=blue, 5=gray)
10. Multiple review modes (Character→Meaning, Meaning→Character, Listening→Meaning)
11. Tags and filtering (HSK level, custom tags)
12. Daily streak tracking
13. Basic stats (cards reviewed today, accuracy)

### 🔵 Nice to Have
14. Handwriting canvas (draw character from memory)
15. Stroke order animation display
16. Character decomposition view (show radicals & components)
17. XP / leveling system with achievements
18. Import from CSV / HSK word lists
19. Audio pronunciation (TTS or pre-recorded)
20. Example sentence display with word highlighting
21. "Related characters" suggestions (same radical, similar pronunciation)
22. Detailed analytics dashboard with charts
23. Dark mode

### 🟣 Stretch / Creative
24. **"Character Story" mnemonic generator** — AI-assisted mnemonic creation based on radical meanings
25. **"Character Family" explorer** — visual graph showing how characters relate through shared components
26. **Cloze-deletion sentence cards** — fill in the blank in a sentence
27. **Speed round mini-game** — timed multiple-choice blitz
28. **Leaderboard** (anonymous, opt-in)
29. **Deck sharing / public deck marketplace**
30. **Progressive Web App (PWA)** with offline support

---

## 7. Sprint Plan

---

### 🏁 Sprint 1 — Foundation & Core Flashcards *(~1 week)*

**Goal**: A working app where a user can sign up, create decks, add cards manually, and do a basic review session.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-1.1 | As a **new user**, I want to **register with email and password** so that I can have my own account. | Registration form validates input; user record created in DB; JWT returned on success. |
| US-1.2 | As a **registered user**, I want to **log in** so that I can access my decks and cards. | Login with correct credentials returns JWT; invalid credentials show error. |
| US-1.3 | As a **learner**, I want to **create a new deck** with a name so that I can organize my characters by topic. | Deck appears in deck list after creation; name is editable. |
| US-1.4 | As a **learner**, I want to **add a card** to a deck by typing the character, pinyin, and meaning so that I can build my study material. | Card is saved with all three fields; appears in the deck's card list. |
| US-1.5 | As a **learner**, I want to **edit or delete a card** so that I can fix mistakes or remove unwanted cards. | Edit updates fields in DB; delete removes card from list and DB. |
| US-1.6 | As a **learner**, I want to **review cards sequentially** (show character → tap to reveal pinyin + meaning → next) so that I can start studying immediately. | Cards cycle one by one; tapping reveals the back; "Next" advances to the next card. |
| US-1.7 | As a **learner**, I want to **see my deck list on the dashboard** so that I know what I've created. | Dashboard shows all decks with name and card count. |

#### Deliverables
- Project scaffolding: Vite React frontend + Express backend + Prisma + PostgreSQL
- Railway deployment pipeline
- **Database schema v1**: `User`, `Deck`, `Card` tables
- **Auth**: Registration, login, JWT-based session
- **Deck CRUD**: Create, rename, delete decks
- **Card CRUD**: Add card (character, pinyin, meaning — all manual), edit, delete
- **Basic Review**: Sequential card flip (no SRS yet)
- **Minimal UI**: Top bar with logo, deck list page, card list page, review page

**Definition of Done**: User can register → create a deck → add 5 cards → review them one by one → deployed on Railway and accessible via URL.

---

### 🏁 Sprint 2 — Spaced Repetition Engine & Improved UX *(~1 week)*

**Goal**: Review sessions are now intelligent — cards appear based on SRS scheduling. The UI gets polished.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-2.1 | As a **learner**, I want to **rate each card** (Again / Hard / Good / Easy) after seeing the answer so that the app knows how well I remembered it. | Four rating buttons appear after reveal; selection is recorded. |
| US-2.2 | As a **learner**, I want the app to **schedule my next review** using spaced repetition so that I review cards right before I'd forget them. | SM-2 algorithm computes `nextReviewDate` based on rating; card reappears on the correct day. |
| US-2.3 | As a **learner**, I want to **see only cards due today** when I start a study session so that I'm not overwhelmed. | "Study" button fetches cards where `nextReviewDate ≤ today`; no future cards shown. |
| US-2.4 | As a **learner**, I want to **mix in a few new (unseen) cards** each session so that I'm always learning fresh material. | Setting to include N new cards per session (default 5); new cards appear after due cards. |
| US-2.5 | As a **learner**, I want to **see a session summary** after finishing so that I know how I did. | Summary shows: cards reviewed, accuracy %, next session forecast. |
| US-2.6 | As a **learner**, I want the **card to flip with a smooth animation** so that the experience feels polished. | CSS 3D flip transition on reveal; responsive on mobile. |
| US-2.7 | As a **learner**, I want to **see a progress bar on each deck** so that I know how close I am to mastering it. | Deck card shows mastery % (mature cards / total cards). |

#### Deliverables
- **SM-2 Algorithm Implementation**: New `CardProgress` table with `easeFactor`, `interval`, `repetitions`, `nextReviewDate`, `lapses`
- **Smart Session Launcher**: Fetches due cards ordered by urgency
- **New card introduction**: Mix N new cards per session
- **Session summary screen**
- **UI Polish**: Responsive layout, card flip animation, deck mastery progress bar, empty states

**Definition of Done**: User adds 20 cards → reviews today's due cards → rates them → tomorrow only the appropriate subset reappears. Deployed.

---

### 🏁 Sprint 3 — Dictionary Integration & Multi-Mode Review *(~1 week)*

**Goal**: Adding a card is now semi-automatic via CC-CEDICT. Multiple review modes available.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-3.1 | As a **learner**, I want the app to **auto-suggest pinyin, meaning, and HSK level** when I type a character so that I don't have to look things up manually. | Typing a character triggers CC-CEDICT lookup; suggestions appear below the input; user can accept or override. |
| US-3.2 | As a **learner**, I want **pinyin displayed with tone colors** (Tone 1=red, 2=orange, 3=green, 4=blue, 5=gray) so that I can quickly see the tones. | All pinyin rendered with correct tone colors throughout the app (cards, review, editor). |
| US-3.3 | As a **learner**, I want to **choose my review mode** before a session (Character→Meaning, Meaning→Character, Mixed) so that I can train different recall skills. | Mode selector on study launch screen; session uses the chosen mode; "Mixed" randomizes per card. |
| US-3.4 | As a **learner**, I want to **tag my cards** (e.g., "HSK1", "food") so that I can organize and filter them. | Tags are addable/removable on card editor; deck view can filter by tag. |
| US-3.5 | As a **learner**, I want to **search across all my cards** by character, pinyin, or meaning so that I can quickly find a specific card. | Search bar on deck/card list; results update as user types; matches highlighted. |
| US-3.6 | As a **learner**, I want to **study only cards with a specific tag** so that I can focus on a topic or HSK level. | Tag filter on session launcher; only matching cards included in the session. |

#### 🔧 Key Resource: CC-CEDICT Dictionary

- **What**: Free, community-maintained Chinese-English dictionary with ~120,000 entries [1]
- **Data fields**: Traditional character, simplified character, pinyin (with tone numbers), English definitions
- **Integration approach**: Parse the CC-CEDICT text file and load into PostgreSQL (indexed on `simplified` and `traditional` columns) for fast server-side lookup. Alternatively, use the Python library [`pycccedict`](https://pypi.org/project/pycccedict/) for prototyping. [6]
- **Source**: [mdbg.net/chinese/dictionary?page=cc-cedict](https://www.mdbg.net/chinese/dictionary?page=cc-cedict)

#### Deliverables
- **CC-CEDICT Integration**: Parsed into PostgreSQL; API endpoint for character lookup
- **Auto-suggest on card editor**
- **Pinyin Tone Coloring** across the app
- **Multiple Review Modes**: Character→Meaning, Meaning→Character, Mixed
- **Tags System** with filtering
- **Search** across all cards

**Definition of Done**: User types "学" → app auto-fills "xué / to study / HSK1" → user saves → can review in meaning→character mode. Deployed.

---

### 🏁 Sprint 4 — Character Deep Dive & Handwriting *(~1 week)*

**Goal**: The app now teaches *how* characters work and lets users practice writing with stroke-by-stroke feedback.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-4.1 | As a **learner**, I want to **see the radical and components** of a character so that I understand its structure. | Card detail page shows decomposition (e.g., 想 = 木 + 目 + 心) with component meanings. |
| US-4.2 | As a **learner**, I want to **watch a stroke order animation** for any character so that I learn the correct writing sequence. | "Animate" button plays stroke-by-stroke animation on card detail; replay and speed controls available. |
| US-4.3 | As a **learner**, I want to **practice drawing a character on a canvas** with stroke-by-stroke validation so that I build muscle memory. | Drawing canvas accepts touch/mouse input; each stroke validated in real-time; hints shown after 3 misses. |
| US-4.4 | As a **learner**, I want my **handwriting practice to count as a review** and feed into the SRS so that writing practice contributes to my scheduling. | Completing a handwriting quiz generates a rating (based on mistakes) and updates `CardProgress`. |
| US-4.5 | As a **learner**, I want to **see related characters** (same radical or similar pronunciation) on the card detail page so that I can discover connections. | "Related" sidebar shows clickable characters; if user has the card, link to it; if not, offer "Add to deck". |
| US-4.6 | As a **learner**, I want to **slow down or replay** the stroke animation so that I can study difficult characters carefully. | Speed slider (0.5x, 1x, 2x); replay button resets and re-animates. |

#### 🔧 Key Resource: Hanzi Writer

- **What**: Free, open-source JavaScript library for stroke order animations and writing quizzes [2]
- **Size**: Only ~35kb (10kb gzipped) — minimal bundle impact
- **Coverage**: 9,000+ simplified and traditional characters
- **Features used**:
  - `HanziWriter.create()` — render character with animation
  - `.animateCharacter()` — play stroke order animation
  - `.quiz()` — interactive stroke-by-stroke writing quiz with `onMistake`, `onCorrectStroke`, `onComplete` callbacks
  - `showHintAfterMisses` option — configurable hint threshold
- **Data source**: [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) project — SVG stroke data for each character [2]
- **CDN**: `https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js`
- **npm**: `npm install hanzi-writer`
- **Source**: [hanziwriter.org](https://hanziwriter.org/) [1] and [GitHub](https://github.com/chanind/hanzi-writer) [2]

#### 🔧 Key Resource: CJK Decomposition / IDS Data

- **What**: Ideographic Description Sequences that map each character to its structural components
- **Example**: 想 → ⿱相心 → ⿱⿰木目心 (tree + eye + heart)
- **Source**: [cjkvi/cjkvi-ids on GitHub](https://github.com/cjkvi/cjkvi-ids)

#### Deliverables
- **Character Decomposition Panel**: Visual breakdown using CJK IDS data
- **Stroke Order Animation**: Hanzi Writer integrated on card detail page
- **Handwriting Practice Mode**: Canvas with Hanzi Writer quiz mode; stroke validation; SRS integration
- **"Related Characters" Sidebar**: Characters sharing the same radical or phonetic component

**Definition of Done**: User views "想", sees it broken into components with meanings, watches stroke animation, draws it on canvas with guided feedback. Deployed.

---

### 🏁 Sprint 5 — Gamification & Stats *(~1 week)*

**Goal**: Make the app addictive with XP, streaks, achievements, and rich analytics.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-5.1 | As a **learner**, I want to **earn XP for each card I review** so that I feel a sense of progress. | XP awarded per review (e.g., Again=5, Hard=8, Good=10, Easy=15); streak multiplier applied; total visible on dashboard. |
| US-5.2 | As a **learner**, I want to **level up** as I accumulate XP so that I have long-term milestones. | Level thresholds defined; level badge shown on dashboard and top bar; level-up animation on threshold. |
| US-5.3 | As a **learner**, I want to **maintain a daily streak** so that I stay motivated to study every day. | Streak increments when ≥1 review done per day; resets on miss; 🔥 counter on dashboard with animation. |
| US-5.4 | As a **learner**, I want a **streak freeze** (1 free miss per week) so that one bad day doesn't ruin my streak. | Streak freeze auto-applied on first missed day per week; visual indicator when freeze is used/available. |
| US-5.5 | As a **learner**, I want to **unlock achievements** (e.g., "First Card", "7-Day Streak", "100 Reviews") so that I have fun milestones to chase. | Achievement definitions stored; toast notification on unlock; achievements page shows earned/locked badges. |
| US-5.6 | As a **learner**, I want to **see a stats dashboard** with heatmap, accuracy trend, mastery breakdown, and review forecast so that I understand my learning patterns. | Stats page shows: GitHub-style heatmap, accuracy line chart, mastery pie chart, reviews bar chart, 7-day forecast. |
| US-5.7 | As a **learner**, I want to **toggle dark mode** so that I can study comfortably at night. | Dark mode toggle in settings; persisted in user preferences; all screens render correctly in both modes. |

#### Deliverables
- **XP System**: Per-review XP with streak multiplier; level thresholds and badges
- **Daily Streak**: Counter, 🔥 animation, streak freeze
- **Achievements / Badges**: Definitions, unlock logic, toast notifications, achievements page
- **Stats Dashboard**: Heatmap, line chart (accuracy), pie chart (mastery stages), bar chart (daily reviews), 7-day forecast
- **Dark Mode Toggle**

**Definition of Done**: User sees their level, streak, and 4+ charts on the stats page. Achievements pop up during review. Dark mode works. Deployed.

---

### 🏁 Sprint 6 — Bulk Import, Sentence Cards & Mini-Games *(~1 week)*

**Goal**: Power-user features and fun variety to prevent study fatigue.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-6.1 | As a **learner**, I want to **import a CSV file** of characters so that I can bulk-add cards without typing each one. | CSV upload (columns: character, pinyin, meaning, tags); progress indicator; duplicate detection with skip/merge option. |
| US-6.2 | As a **learner**, I want to **import an entire HSK level** (1–6) with one click so that I can start with a standard curriculum. | HSK word lists bundled in app; one-click import creates deck with all cards; CC-CEDICT data auto-attached. |
| US-6.3 | As a **learner**, I want to **see example sentences** on each card so that I understand the character in context. | 1–3 sentences displayed on card back with pinyin annotation and English translation. |
| US-6.4 | As a **learner**, I want a **cloze (fill-in-the-blank) review mode** where the target word is blanked in a sentence so that I practice contextual recall. | Sentence shown with blank; user must recall the word; rated and fed into SRS. |
| US-6.5 | As a **learner**, I want to **play a 60-second speed round** (multiple choice: character → pick meaning) so that I can have fun while reinforcing knowledge. | Timer counts down; 4-choice MCQ per question; score based on speed + accuracy; personal best tracked. |
| US-6.6 | As a **learner**, I want to **explore a "Character Family" graph** where I pick a radical and see all my characters that use it so that I discover structural patterns. | Interactive graph/tree; click radical → see related characters; click character → navigate to card detail. |

#### 🔧 Key Resource: Tatoeba Sentence Corpus

- **What**: Free, community-built database of translated sentences in 400+ languages
- **Use**: Query Chinese sentences containing the target character/word, paired with English translations
- **Source**: [tatoeba.org](https://tatoeba.org/)

#### 🔧 Key Resource: D3.js (for Character Family graph)

- **What**: JavaScript library for data-driven visualizations
- **Use**: Force-directed graph to visualize radical → character relationships
- **Source**: [d3js.org](https://d3js.org/)

#### Deliverables
- **Bulk Import**: CSV upload + one-click HSK level import with duplicate detection
- **Example Sentences**: Auto-attached from Tatoeba or bundled dataset; pinyin annotation + translation
- **Cloze Mode**: Fill-in-the-blank sentence review
- **Speed Round Mini-Game**: 60-second timed MCQ with scoring
- **"Character Family" Explorer**: Interactive radical → character graph (D3.js)

**Definition of Done**: User imports HSK2 list (150 words) in one click → studies with cloze sentences → plays speed round → explores the radical "水" and sees all water-related characters they know. Deployed.

---

### 🏁 Sprint 7 — Polish, PWA & Social Features *(~1 week)*

**Goal**: Production-quality polish, offline capability, and light social/sharing features.

#### 📖 User Stories

| # | User Story | Acceptance Criteria |
|---|---|---|
| US-7.1 | As a **learner**, I want to **install the app on my phone** as a PWA so that it feels like a native app. | Service worker registered; install prompt shown on mobile; app icon on home screen; works offline for cached content. |
| US-7.2 | As a **learner**, I want to **review cards offline** so that I can study on the subway without internet. | Due cards cached locally; reviews recorded offline; synced to server when back online. |
| US-7.3 | As a **learner**, I want to **share a deck via link** so that my friend can clone it into their account. | "Share" button generates a unique URL; recipient can view and "Clone to my account" (requires login). |
| US-7.4 | As a **learner**, I want to **browse a public deck gallery** so that I can discover and clone community-created decks. | Gallery page with search/filter; preview deck contents; one-click clone. |
| US-7.5 | As a **learner**, I want to **see and submit community mnemonics** on each card so that I can benefit from others' memory tricks. | Mnemonic section on card detail; submit text mnemonic; upvote/downvote; sorted by votes. |
| US-7.6 | As a **new user**, I want a **guided onboarding flow** so that I understand how to use the app quickly. | 3-step tutorial on first login; suggests a starting deck based on self-assessed level; skippable. |
| US-7.7 | As a **visitor**, I want to **see a landing page** explaining the app's features so that I'm convinced to sign up. | Marketing-style page with feature overview, screenshots, and CTA button; accessible without login. |

#### Deliverables
- **Progressive Web App (PWA)**: Service worker, offline review, install prompt, background sync
- **Deck Sharing**: Shareable links, clone functionality, public deck gallery
- **Mnemonic Community Notes**: Submit, upvote/downvote per card
- **Onboarding Flow**: 3-step walkthrough, level assessment, starter deck suggestion
- **Performance & Polish**: Lazy loading, code splitting, skeleton states, error boundaries, rate limiting, input sanitization
- **Landing Page**: Marketing page for logged-out users

**Definition of Done**: App installable as PWA on phone, works offline for review. User can share a deck link. New users get a smooth onboarding. Lighthouse score >90. Deployed on Railway as production release.

---

## 8. Sprint Summary Timeline

```
Sprint 1  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Foundation & Core CRUD
Sprint 2  ░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░  SRS Engine & UX
Sprint 3  ░░░░░░░░░░░░██████░░░░░░░░░░░░░░░░░  Dictionary & Multi-Mode
Sprint 4  ░░░░░░░░░░░░░░░░░░██████░░░░░░░░░░░  Decomposition & Handwriting
Sprint 5  ░░░░░░░░░░░░░░░░░░░░░░░░██████░░░░░  Gamification & Stats
Sprint 6  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█████  Import, Sentences & Games
Sprint 7  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  PWA, Social & Polish
           Week 1    Week 2    Week 3    Week 4    Week 5    Week 6   Week 7
```

---

## 9. Railway Deployment Architecture

```
┌─────────────────────────────────────────┐
│              Railway Project            │
│                                         │
│  ┌─────────────┐    ┌───────────────┐   │
│  │  Web Service │    │  PostgreSQL   │   │
│  │  (Node.js)  │◄──►│   Database    │   │
│  │             │    │              │   │
│  │ - Express   │    │ - Users      │   │
│  │ - API routes│    │ - Decks      │   │
│  │ - Serves    │    │ - Cards      │   │
│  │   React SPA │    │ - Reviews    │   │
│  │   (static)  │    │ - Stats      │   │
│  └─────────────┘    └───────────────┘   │
│         │                               │
│         │  PORT env var                  │
│         │  DATABASE_URL env var          │
└─────────────────────────────────────────┘
```

- **Single service** serves both API (`/api/*`) and the built React frontend (static files)
- Prisma runs migrations on deploy via a release command
- Environment variables managed through Railway dashboard

---

## 10. Key Resources Summary

| Resource | Type | Sprint Used | Purpose |
|---|---|---|---|
| [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) | Dictionary DB | Sprint 3 | Auto-fill pinyin, meanings, HSK levels [1] |
| [Hanzi Writer](https://hanziwriter.org/) | JS Library (10kb) | Sprint 4 | Stroke animations & handwriting quiz [2] |
| [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) | Character Data | Sprint 4 | SVG stroke data for 9,000+ characters [2] |
| [CJK Decomposition (IDS)](https://github.com/cjkvi/cjkvi-ids) | Data File | Sprint 4 | Radical/component decomposition trees |
| [Tatoeba](https://tatoeba.org/) | Sentence Corpus | Sprint 6 | Example sentences with translations |
| [D3.js](https://d3js.org/) | JS Library | Sprint 6 | Character Family graph visualization |
| [pycccedict](https://pypi.org/project/pycccedict/) | Python Library | Prototyping | Quick CC-CEDICT lookups during dev [6] |

---

## 11. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| CC-CEDICT data is large (~120K entries) | Pre-parse and load into PostgreSQL; index on character field [1] |
| Hanzi Writer adds bundle size | Lazy-load only on card detail / handwriting pages (only 10kb gzipped) [2] |
| SRS algorithm bugs cause cards to never reappear | Comprehensive unit tests for SM-2 logic; admin "reset" option |
| Handwriting recognition accuracy | Use Hanzi Writer's built-in stroke matching (proven library) rather than building custom ML [2] |
| Scope creep across sprints | Each sprint has a clear "Definition of Done"; features not met roll to next sprint |
| Tatoeba sentence quality varies | Pre-filter and curate sentence dataset; allow user flagging of poor examples |

---

This updated plan now includes **user stories with acceptance criteria for every sprint** and **specific developer resources mapped to where they're needed**. Each sprint remains independently deployable, and you're never more than a week away from a working product. 🚀