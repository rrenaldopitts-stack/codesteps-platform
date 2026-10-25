# CodeSteps

A beginner-friendly full-stack learning website for learning to code **alongside AI, not on autopilot**. Built with Next.js App Router, TypeScript, and Tailwind CSS.

## Run locally

Requires Node.js 20.9+ and npm. Node.js 22 LTS is recommended.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). No environment variables, database, AI key, or account are required.

```bash
npm run lint     # ESLint, including Next.js and React rules
npm run build    # Production build and TypeScript checks
npm start       # Serve the production build
```

## Walkthrough

- **Home `/`**: explore the learning philosophy, curriculum, and benefits.
- **Dashboard `/dashboard`**: a mock signed-in workspace with four beginner modules, actual demo-session progress, and continue/revisit actions.
- **Lessons `/lessons/your-first-page`**: read instructions, attempt a task in a scratchpad, request hints, save a reflection, and mark completion. The other modules cover JavaScript, React, and APIs.
- **Practice `/challenges`**: choose a challenge, test your solution in your own editor, review every rubric item, then mark it complete. Completion can be undone.

The **Ask AI** panel is clearly labeled as a **scripted local demo**, not a live AI service. It offers lesson-specific hints, explanations for a few common error patterns, and self-review checklists. It does not analyze or grade code. Prompts can also be copied into your preferred AI tool.

Scratchpad code and error messages stay in the current tab: they are **not executed, uploaded, or saved**. Copy your code before navigating away. Reflection notes are saved only when you choose **Save reflection**.

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
src/server/       Demo-session repository and HTTP validation helpers
```

`src/lib/types.ts` defines `User`, `Module`, `Lesson`, `Challenge`, `Progress`, `Note`, request payloads, and the `ApiResponse<T>` envelope. Curriculum fixtures live in `src/lib/curriculum.ts`. Replace the repository in `src/server/store.ts` with database-backed storage and real authenticated user identities to evolve the MVP.

### Important demo limitations

- There is **no real authentication**. A random HttpOnly, SameSite cookie isolates each browser’s demo workspace; cookies must be enabled. Production cookies require HTTPS.
- Progress and notes live in a bounded, process-local memory store for up to 24 hours. They can disappear on restart, redeploy, eviction, or when requests reach different server instances. This is not durable storage and is unsuitable for sensitive data.
- The store supports up to 500 demo sessions. Do not depend on it for production accounts or records.
- For production, add authentication/authorization, durable storage, request rate limits, and a privacy policy. A real AI integration should run server-side with protected credentials, consent, and usage limits. Do not execute untrusted learner code on the app server.

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

Writes require same-origin JSON, reject oversized request bodies, and validate resource IDs. Notes are limited to 5,000 characters. Completion updates are idempotent. User identity is determined by the demo cookie, never by a supplied user ID.

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
