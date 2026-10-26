# LearnFlow AI

A beginner-friendly full-stack learning website for learning to code **alongside AI, not on autopilot**. Built with Next.js App Router, TypeScript, Tailwind CSS, and locally owned shadcn-style UI primitives.

## Run locally

Requires Node.js 20.9+ and npm. Node.js 22 LTS is recommended.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No AI key, database service, or account is required to try notes-based courses. With `DATABASE_URL` unset, data is saved in local SQLite at `.data/codesteps.db`; set `CODESTEPS_DATA_DIR` to use another private persistent directory. Configure Neon for shared or serverless deployments.

```bash
npm run lint     # ESLint, including Next.js and React rules
npm run build    # Production build and TypeScript checks
npm start       # Serve the production build
```

### Connect your Neon database

1. In your Neon project, open **Connect** and copy the PostgreSQL connection string. Prefer the pooled endpoint for deployments with multiple app instances.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` there. For deployment, set it in your hosting provider's server-side secret settings instead.
3. Restart the app. Tables are initialized automatically when a learner API is first used; the database role needs permission to create the app's tables and indexes.
4. Open `/account` or `/dashboard`, save a reflection or course, and reload to verify persistence.

Never paste the connection string into chat, commit `.env.local`, or use a `NEXT_PUBLIC_` variable. Remote PostgreSQL connections require verified TLS. An invalid or unavailable `DATABASE_URL` produces a safe API error; it does **not** silently save to SQLite.

SQLite and PostgreSQL are separate stores. Setting `DATABASE_URL` does not copy local accounts or courses into Neon. Keep a backup of existing data before switching; removing the variable reconnects to the original local SQLite file. Use Neon for serverless hosting rather than ephemeral local disk. No live Neon connection can be verified without your privately configured connection string.

## Walkthrough

- **Home `/`**: a responsive, dark-by-default landing page with a light-mode toggle, topic search, expandable roadmap cards, learning features, and a sample dashboard.
- **My Courses `/courses`**: see saved courses created from your own notes.
- **Create Course `/courses/new`**: choose a topic, paste notes, import a `.txt`/`.md` file, or start from a sample.
- **Course Overview `/courses/:id`**: see matched lessons and continue your practice path.
- **Lesson Practice `/courses/:id/lessons/:lessonId`**: compare an original note excerpt with added teaching material, explore a real-world use, attempt an exercise, answer a quiz, and save a reflection.
- **Manage Notes `/courses/:id/notes`**: read your full source notes, append more notes, or delete the entire course.
- **Practice Terminal `/playground`**: run small JavaScript examples with console output, errors, and local or optional live AI help. The same terminal appears in JavaScript course lessons.
- **Dashboard `/dashboard`**: track lessons across saved courses and the starter curriculum, challenge completions, overall progress, and XP. Continue a saved course or beginner module.
- **Lessons `/lessons/your-first-page`**: read instructions, attempt a task in a scratchpad, request hints, save a reflection, and mark completion. The other modules cover JavaScript, React, and APIs.
- **Practice `/challenges`**: choose a challenge, test your solution in your own editor, review every rubric item, then mark it complete. Completion can be undone.

### How the homepage works

The homepage is a landing experience, not a new backend course-generation service. **Generate Learning Path** matches JavaScript, Python, React, SQL, TypeScript, Node.js, or AI Engineering to a curated preview. It handles aliases such as `js` and unsupported/empty searches without making external requests. Relevant previews open an existing lesson or an official external learning resource. Roadmap buttons expand their ordered steps inline.

The homepage dashboard preview uses **sample design data**, not live account metrics. The real `/dashboard` calculates XP from current saved completions: 25 per lesson and 50 per challenge, including notes-based courses. Undoing completion or deleting a course reduces that total; XP is derived, not an independent rewards ledger. Streaks and badges remain previews. Learner quotes are explicitly **illustrative placeholders**, not verified endorsements. The **View Demo** action jumps to the sample dashboard. **Blog** opens a short learning-journal dialog, documentation opens this README, and contact opens the repository's GitHub issue form. GitHub links to this repository; LinkedIn and Twitter/X icons link to their platform homepages, not invented company profiles.

The homepage itself requires no API key, database, or external fonts/images. Theme selection is scoped to the homepage and resets to dark on reload. Learner data uses local SQLite by default or PostgreSQL when the server-only `DATABASE_URL` is set.

#### Files and beginner-friendly responsibilities

| File or folder | What it does / what to learn |
| --- | --- |
| `src/app/page.tsx` | Server-rendered page composition: hero, features, roadmaps, three steps, learner stories, dashboard preview, CTA, and footer. Learn semantic HTML, JSX, and mapping data into cards. |
| `src/components/home/landing-shell.tsx` | Client-side dark/light toggle and accessible mobile menu. Learn React state, events, and cleanup of an Escape-key listener. |
| `src/components/home/topic-search.tsx` | Labeled search form, suggestion buttons, curated results, and empty/unknown input feedback. Learn controlled inputs, form submission, and conditional rendering. |
| `src/components/home/code-preview.tsx` | Static code-themed illustration. It displays code rather than executing it. |
| `src/components/home/dashboard-preview.tsx` | Reusable sample dashboard with a labeled Radix progress bar. Keeps demonstration data separate from real learner progress. |
| `src/components/home/section-heading.tsx` | Shared section title/description layout, using props instead of repeated markup. |
| `src/components/home/learning-journal.tsx` | Native modal dialog with browser-managed focus and Escape behavior. |
| `src/components/home/social-icons.tsx` | Small local SVG social icons, avoiding another icon dependency. |
| `src/components/ui/` | Locally owned shadcn-style Button, Card, Input, Badge, and Progress primitives; Radix supplies slot composition and progress semantics, CVA defines button variants. |
| `src/lib/home-content.ts` | Typed topics, roadmaps, and placeholder stories, separated from presentation. |
| `src/lib/utils.ts` | The `cn` helper combines conditional classes and resolves Tailwind class conflicts. |
| `src/app/home.css` | Homepage-scoped theme tokens, gradients, visual treatments, responsive adjustments, focus states, and reduced-motion behavior. Tailwind handles layout and spacing in components. |
| `src/components/site-frame.tsx` | Preserves the existing learning-page header/footer while letting the homepage use its own dark navigation. |
| `components.json` | shadcn configuration for aliases, CSS, and component locations. The CLI registry was unreachable during implementation; primitives were integrated locally using the same compositional patterns. |

#### Verify the homepage

Run `npm run lint` and `npm run build`, then `npm start`.

1. Check desktop and narrow mobile widths in both themes.
2. Submit a topic, use every suggestion, test `js`, and try empty and unknown input.
3. Open every roadmap and follow its first-step link.
4. Tab through the page, use the skip link, open/close mobile navigation, and close it with Escape.
5. Open **Blog**, verify focus stays in the dialog, close with Escape, and confirm focus returns.
6. Follow the primary CTAs and verify the existing account, course, practice, and dashboard pages still work without duplicate navigation.

### How notes-based courses work

Course generation is **local, deterministic concept matching**, not a live AI model or a general-purpose document reader. It matches supported terms in your selected topic to curated lessons. It never treats your notes as verified facts.

| Topic | Supported lesson concepts |
| --- | --- |
| JavaScript | Variables, arrays, nested indexing, mutation, copying/searching, numeric sorting, filter/reduce, loops, strings, functions, scope, objects, methods/`this` |
| HTML & CSS | Semantic HTML, CSS box model / responsive sizing |
| React | Components and props |
| APIs | Fetch, async/await, HTTP responses, JSON |

Each lesson clearly separates **“From your notes”** (a verbatim, unverified excerpt) from **“Added teaching material”** (authored explanations, glossary definitions, exercises, quizzes, and real-world examples). For instance, array notes lead to a shopping-cart connection and a price-transformation exercise. The tool does not comprehensively summarize arbitrary documents or check every statement in them. Unsupported notes produce a helpful message rather than an invented lesson.

**To add a file:** open **Create Course** or **Manage Notes**, choose a `.txt` or `.md` file under 100 KB, review the imported text, then save. Imported text is appended to the editable box. PDFs, Word documents, images, and ZIP files are not parsed; copy their text into the box instead. Each submission accepts 20–25,000 characters (up to 100 KB). The JavaScript sample condenses the supplied study notes, including claims to compare with the clarifications.

**As you add more notes:** newly mentioned supported concepts add lessons. Existing lesson IDs, attempts, quiz choices, completion, and reflections remain intact. Repeated concepts do not create duplicates. If no new supported concept is found, the notes are still saved, but lessons do not change. Course topics remain fixed; create another course for a different topic. Combined source notes are limited to 100,000 characters and 200 KB. You can create up to 12 saved courses before needing to delete an older one.

**Improve your notes:** the notes page builds an editable study guide from the current lessons, with plain-language explanations, definitions, corrections, and real-world connections. Original notes are preserved separately. Corrections cover pitfalls such as `map()` versus mutation, numeric `sort()` comparators, `slice()` versus `splice()`, the limit in `split()`, and case-sensitive names. This is curated enrichment, not an assertion that every error in a document was detected. Save your own guide edits, or explicitly rebuild a fresh draft after adding new lessons. Rebuilding never silently replaces saved edits.

**Adapt to your practice:** a lesson’s saved “needs more practice” goal adds it to the course’s review queue. Continue actions prioritize flagged incomplete lessons, then other unfinished lessons. Clear the practice goal and save when you no longer need that review. Progress, recommendations, and review queues derive from your stored work rather than static demo values.

**Practice before answers:** reveal hints one at a time. A sample solution unlocks after both hints and a written attempt. Quiz feedback explains the answer. Completion requires an attempt, the correct quiz choice, and a reflection; code is not automatically graded. Editing completed work marks it incomplete when saved. Save before navigating away: drafts are not autosaved.

Notes-based **course generation never calls an external AI provider**. The coding coach defaults to local guidance and has an optional live mode when configured by the server operator; it requires an account and explicit consent. Live help sends only the selected lesson title/task, current code, last error, intent, and your question—not source notes, passwords, or reflections. AI output is plain text and may be wrong. Test suggestions rather than copying them blindly.

The original curriculum scratchpads are not saved. In notes-based course lessons, your solution text, quiz choice, reflection, and “needs more practice” notes are saved to this server only when you choose **Save practice & reflection** or **Complete lesson**.

### JavaScript practice terminal

The terminal explicitly runs code only when you choose **Run JavaScript**. It uses a Web Worker inside a sandboxed, opaque-origin iframe with a restrictive Content Security Policy. It has no app cookies/storage, network, DOM, Node.js shell, imports, JSX, or TypeScript. Runs are stopped after three seconds or 100 output lines. Stop, clear output, and reset controls are provided.

Terminal code/output stay in the tab unless you explicitly consent to live AI help. Copy your working code into the lesson’s saved answer to keep it. The runner is a learning aid for small trusted examples, not a memory-hardened execution service for adversarial code; very large allocations can still strain a browser. HTML/CSS and React examples should be tested in your own editor. No learner code is executed on the server.

### Enable optional live AI help

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` on the server. `OPENAI_MODEL` defaults to `gpt-4o-mini`. Restart the server, sign in via `/account`, then enable **Use live AI** in the terminal or lesson coach and consent to the specific sharing described there. Never use a `NEXT_PUBLIC_` variable for provider credentials.

The server uses OpenAI's chat completions endpoint with a 20-second timeout, bounded input/output, and persisted limits of five requests per minute and 30 per day per account, plus a global 500/day ceiling. Provider charges may apply. Failures keep your code intact and suggest local guidance. Local course generation and local hints need no key. The `github/copilot.vim` plugin is for Vim/Neovim, not a browser integration; this website does not install or depend on it.

## Learn with AI: a repeatable loop

1. Choose one small task and read the lesson.
2. Try it yourself for 15–20 minutes. Run the code in your local editor or browser tools.
3. Ask: “I’m learning. Give me a hint, not the answer. What concept am I missing?”
4. Make the change yourself. Test normal inputs, empty inputs, and a failure case.
5. Ask for a review, then explain the improvements in your own words.
6. Write a five-line reflection: what you built, what broke, how you fixed it, one new concept, and tomorrow’s question.
7. Complete the independent challenge without looking at a full solution.

Never paste credentials, personal data, or private code into an AI tool or this demo.

## Structure and future persistence

```text
src/app/          Pages, shared layout, and API route handlers
src/components/   Interactive dashboard, lesson, and challenge workspaces
src/lib/          Shared models, curriculum fixtures, and typed API client
src/server/       Shared repository, PostgreSQL/SQLite drivers, auth, and HTTP validation
```

`src/lib/types.ts` defines the original curriculum models and `ApiResponse<T>` envelope. `src/lib/practice-types.ts` defines courses, lessons, saved practice, and request shapes. `src/lib/practice-catalog.ts` contains authored teaching material; `src/lib/practice-generator.ts` selects concepts and their source excerpts. To expand coverage, add a catalog entry with a topic, matching pattern, explanation, glossary, real-world use, exercise, hints, solution, rubric, and quiz. No new dependency is needed.

### Storage and access

- PostgreSQL (including Neon) stores shared courses, sessions, accounts, rate limits, and learner progress when `DATABASE_URL` is configured. Keep it in `.env.local` or your host's secret store and use the database provider's backups.
- Without `DATABASE_URL`, SQLite keeps the same data in `CODESTEPS_DATA_DIR` (default `.data`). Preserve this directory across server restarts, restrict its access, and back it up. It is suitable for a single-server deployment, not a shared serverless filesystem.
- A random HttpOnly, SameSite session cookie scopes every course API request to its owner. Guest access lasts up to 30 days and depends on retaining that cookie. Production cookies require HTTPS.
- The existing `/account` page supports username/password registration, sign-in, and sign-out. Guest courses migrate into the account when registering or signing in, without losing their practice data. Accounts allow access from another browser; they do not provide password recovery.
- The notes page supports permanent course deletion, including its source notes and reflections.
- Don’t store sensitive information. Before a public deployment, review authentication, backups, request limits, privacy/retention policy, and your deployment’s security requirements. Never execute untrusted learner code on the app server.

## API

Success responses are `{ "data": ... }`; failures are `{ "error": "..." }`. Invalid input returns `400`; unknown learning resources return `404`. Personalized reads are not cached.

| Method | Route | Payload / result |
| --- | --- | --- |
| GET | `/api/modules` | `Module[]` |
| GET | `/api/lessons` | `Lesson[]` |
| GET | `/api/lessons/:id` | `Lesson` |
| GET | `/api/challenges` | `Challenge[]` |
| GET | `/api/challenges/:id` | `Challenge` |
| GET | `/api/progress` | Current demo learner’s `Progress`; initializes session |
| PATCH | `/api/progress` | `{ kind: "lesson" \| "challenge", id: string, complete: boolean }` → `Progress` |
| GET | `/api/notes?lessonId=...` | `Note` or `null` |
| PUT | `/api/notes` | `{ lessonId: string, content: string }` → `Note` |
| GET | `/api/courses` | Current learner’s `PracticeSummary[]` |
| POST | `/api/courses` | `{ topic, notes }` → saved `PracticeCourse` |
| GET | `/api/courses/:id` | Owner-scoped `PracticeCourse` |
| PATCH | `/api/courses/:id` | `{ additionalNotes }` → course with new concepts appended |
| PATCH | `/api/courses/:id` | `{ lessonId, entry: { answer, quizChoice, reflection, needsPractice, complete } }` → saved course |
| PATCH | `/api/courses/:id` | `{ improvedNotes: string }` → course with edited study guide (up to 25,000 characters) |
| DELETE | `/api/courses/:id` | `{ confirm: true }` → `{ deleted: true }` |
| GET | `/api/ai` | `{ available: boolean }` |
| POST | `/api/ai` | `{ lessonId, courseId?, code, error, question?, intent, consent: true }` → `{ text }`; sign-in required |

Writes require same-origin JSON, reject oversized bodies (200 KB for course writes; 24 KB elsewhere), and validate resource IDs. Course exercise drafts allow 8,000 characters, reflections 3,000, and “needs practice” notes 2,000. `quizChoice` is a zero-based integer or `null`; completion is boolean. Course creation is limited to 20 requests per learner per hour. Course updates are transactional; foreign owners receive 404, not another learner’s data. User identity is determined by the session cookie, never by a supplied user ID. For terminal AI help without a course, use `lessonId: "playground"`; course lessons additionally require their owner-scoped `courseId`.

Example against the local development server (the cookie jar preserves the demo session):

```bash
curl -c /tmp/codesteps-cookies http://localhost:3000/api/progress
curl -b /tmp/codesteps-cookies -c /tmp/codesteps-cookies \
  -X PATCH http://localhost:3000/api/progress \
  -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -d '{"kind":"lesson","id":"your-first-page","complete":true}'
```

## Manual verification

There was no existing test infrastructure in the initial repository. Use lint and the production build above, then:

1. Visit the home page at desktop and mobile widths; follow both CTAs.
2. Open a lesson, edit the scratchpad, and try all three helper prompts.
3. Save a reflection, reload, and verify the note returns.
4. Complete the lesson; confirm dashboard progress changes. Undo completion.
5. Open a challenge. Confirm completion is disabled until all rubric items are checked. Complete it, reload, then undo completion.
6. Use a separate browser context to verify notes and progress are isolated.
7. Check unknown lesson/challenge IDs return 404; malformed JSON, invalid completion values, oversized notes, and cross-origin writes are rejected.
8. Tab through navigation, fields, helper buttons, rubric checkboxes, and save/complete controls. Check the skip link and narrow-screen layout.
9. Open `/courses/new`, choose JavaScript, and try sample notes or a `.txt`/`.md` import. Confirm unsupported topics/notes get a helpful error.
10. Create a course. Open a lesson and verify the source excerpt is separate from curated explanations, glossary, and real-world examples.
11. Attempt an exercise, reveal hints before the sample solution, answer the quiz, write a reflection and practice goal, and save. Reload to verify persistence.
12. Complete a lesson. Add notes about a new supported concept via **Manage Notes**; confirm a new lesson appears and earlier work remains unchanged. Re-add the same concept and confirm no duplicates.
13. Restart with the same database configuration (or local data directory) and verify the course remains. Use another browser session to confirm isolation.
14. Register or sign in after creating a guest course; verify it migrates. Delete the course from **Manage Notes** and confirm it no longer appears.
15. Edit and save improved study notes. Add a new concept; verify your saved guide stays unchanged until you choose to rebuild and save it.
16. Save a “needs more practice” goal and verify the review queue recommends that lesson.
17. Run JavaScript in `/playground`; verify console output, syntax/runtime errors, timeout on an infinite loop, and blocked network/storage access. Confirm code runs again after a timeout.
18. Without a key, verify local help works and live AI reports unavailable. With a configured key and account, explicitly consent and test a live hint; verify opting out does not send code externally.
19. Complete a notes-course lesson and check `/dashboard`: completed lessons, overall progress, course cards, and XP should update. Undo completion or delete the course and verify totals decrease.
20. Repeat persistence checks with a privately configured PostgreSQL database. An invalid connection must show a helpful error without credentials or silently switching to local storage.
