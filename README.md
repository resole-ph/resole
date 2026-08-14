# Resole

Resole is a marketplace for buying, selling, and swapping used sneakers in the Philippines.
Sellers list their pairs, buyers can buy them outright or swap for another pair, and pairs
that aren't worth reselling can be donated to a partner charity instead. Selling, swapping,
and donating all earn wallet rewards.

Before a listing goes live, we run it through Gemini to check the condition/authenticity
photos and match it against known shoe models via embedding search, to catch bad or
mislabeled listings.

Main features: marketplace browse/search, sell wizard, swap, cart & checkout, in-app inbox
for offers and messages, charity donations, and a rewards wallet with transaction history.

## Monorepo Layout

This is a monorepo with two apps under `apps/`:

- `apps/web` — Next.js app (marketplace web app + API routes)
- `apps/mobile` — Expo / React Native app

## Tech Stack

- **Web:** Next.js (App Router), TanStack Query, Tailwind CSS, Drizzle ORM
- **Mobile:** Expo / React Native, Expo Router, NativeWind, Zustand
- **Data:** PostgreSQL via Supabase (Drizzle ORM for schema/migrations)
- **AI:** Google Gemini (`@google/genai`) for listing condition analysis, embedding-based
  match search
- **Email:** Resend

## Architecture

Both apps follow a feature-driven structure with shared building blocks and feature-specific folders.

```text
resole/
└── apps/
    ├── mobile/                       # Expo / React Native app
    │   └── src/
    │       ├── components/           # Global shared UI components
    │       │   ├── atoms/
    │       │   ├── molecules/
    │       │   ├── organisms/
    │       │   └── ui/
    │       ├── config/               # Env, constants, app settings
    │       ├── features/             # Domain-specific feature modules
    │       │   ├── [feature-name]/   # Copy + rename this folder for new features
    │       │   │   ├── components/
    │       │   │   ├── containers/
    │       │   │   ├── hooks/
    │       │   │   ├── services/
    │       │   │   ├── queries/
    │       │   │   ├── types/
    │       │   │   └── data/
    │       │   └── shared/
    └── web/                          # Next.js app
        └── src/
            ├── app/                  # Next.js App Router
            │   └── api/              # Route handlers
            ├── components/           # Global shared UI components
            ├── config/               # Env, constants, query defaults
            ├── db/                   # Database access and schema helpers
            ├── features/             # Domain-specific feature modules
            │   ├── [feature-name]/   # Copy + rename this folder for new features
            │   └── shared/
            ├── lib/                  # Utilities and global helpers
            ├── providers/            # Global providers (Auth, Theme, Query, etc.)
            ├── queries/              # Global TanStack Query configs
            ├── store/                # Zustand stores
            ├── styles/               # Global and theme styles
            ├── tests/                # Unit and E2E tests
            └── types/                # Global TypeScript types
```

## Naming Conventions

- PascalCase for components and containers
- camelCase for hooks and stores
- dot-case for services, queries, and types
- kebab-case for folders

## Getting Started

1. **Install dependencies** from the repo root (both apps share the root `node_modules` via workspaces):

   ```powershell
   npm install
   ```

2. **Set up environment variables.** Copy the root example file and fill in real values
   (ask a teammate for secrets — don't commit `.env`):

   ```powershell
   cp .env.example .env
   ```

   See [Environment Variables](#environment-variables) below for what each app needs.

3. **Run the apps** from the repo root:

   ```powershell
   npm run dev:web
   npm run dev:mobile
   ```

   Run the two dev commands in separate terminals if you want both apps active at the same time.

Additional root scripts are available:

- `npm run build:web`
- `npm run start:web`
- `npm run lint:web`
- `npm run android:mobile`
- `npm run ios:mobile`
- `npm run web:mobile`

## Testing

Unit tests run on [Vitest](https://vitest.dev/) in both apps. From the repo root:

```powershell
npm test              # both apps
npm run test:web
npm run test:mobile
```

Inside either app, `npm run test:watch` re-runs on save and `npm run test:coverage` prints a
coverage table for `src/lib/` and the feature `utils/` folders.

### Conventions

- **Location.** Tests live in `src/tests/`, mirroring the path of the file under test —
  `src/lib/id.ts` is covered by `src/tests/lib/id.test.ts`. Tests are never co-located with
  source.
- **Naming.** `describe('functionName')` around `it('returns X when Y')`. Test names state
  behaviour, not implementation.
- **Shape.** Arrange / Act / Assert, one behaviour per `it`. Where a function has thresholds or a
  lookup table, probe both sides of every boundary.
- **Isolation.** No network, no database, no real clock. Mock at the module boundary with
  `vi.mock` and use `vi.useFakeTimers()` for anything time-dependent. A test that needs a live
  connection is an integration test and does not belong in `src/tests/`.
- **Fixtures.** Build objects inline. Only extract a factory into `src/tests/fixtures/` once three
  or more tests share it.
- **Parity.** Logic duplicated across web and mobile (the size chart, the condition ladder, the
  password rule) is asserted against the *same* expectation table in both apps' suites, so
  whichever copy drifts fails its own tests.

This pass covers pure logic: authentication helpers, id parsing, size conversion, condition
grading, listing validation, the listing DTO, the inbox list builder, and the mobile request
cache. Component rendering, API route handlers, and DB-backed services are not yet covered.

Note that `apps/web/scripts/listing-retention.contract.test.mjs` is a separate `node:test` file
that pattern-matches migration SQL. It is run on its own with
`node --test apps/web/scripts/listing-retention.contract.test.mjs` and is deliberately excluded
from the Vitest run.

## Environment Variables

Env files are gitignored except for the `.env.example` templates. There are three example files:

| File | Used by |
|---|---|
| `.env.example` (root) | Shared config loaded by web scripts that run outside Next.js (Drizzle migrations, the scraper) |
| `apps/web/.env.example` | The Next.js app itself (dev server, API routes) |
| `apps/mobile/.env.example` | The Expo app |

Copy the relevant file(s) to `.env` (or `.env.local`) in the same folder and fill in values.
Never commit a populated `.env` file — the ones checked into your working copy already contain
real, unrotated production secrets, so double-check `git status` before staging anything env-related.

### Root / `apps/web`

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string (Drizzle ORM) |
| `GOOGLE_OAUTH_CLIENT_IDS` | Comma-separated list of additional allowed Google OAuth client IDs |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_WEB_CLIENT_ID` | Google OAuth client ID for the web client |
| `GOOGLE_IOS_CLIENT_ID` | Google OAuth client ID for the iOS client |
| `GOOGLE_ANDROID_CLIENT_ID` | Google OAuth client ID for the Android client |
| `GOOGLE_GEMINI_API_KEY` | Gemini API key used for listing condition/authenticity analysis and embedding search |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key for server-side storage access |
| `EMBEDDING_MODEL` | Gemini embedding model used for shoe match search (defaults to `gemini-embedding-001`) |
| `EMBEDDING_DIMENSIONS` | Dimensionality of the embedding vectors (defaults to `1536`) |
| `BASELINE_MATCH_THRESHOLD` | Minimum cosine similarity for a baseline shoe match (defaults to `0.75`) |
| `SCRAPE_SITE` | Source site URL for the sneaker catalog scraper |
| `RESEND_API_KEY` | Resend API key used to send transactional emails (e.g. password reset) |
| `RESEND_FROM_EMAIL` | "From" address used when sending emails via Resend |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app, used in email links and redirects |

### `apps/mobile`

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the deployed web app the mobile client talks to |
| `GOOGLE_OAUTH_CLIENT_IDS` | Comma-separated list of additional allowed Google OAuth client IDs |
| `GOOGLE_WEB_CLIENT_ID` | Google OAuth client ID for the web client |
| `GOOGLE_IOS_CLIENT_ID` | Google OAuth client ID for the iOS client |
| `GOOGLE_ANDROID_CLIENT_ID` | Google OAuth client ID for the Android client |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (storage — no service-role key on the client) |

## Contributing

### Branches

Branch off `dev` using `type/short-description`, optionally prefixed with the issue number:

```text
feat/119-hard-delete-shoe-listings
fix/market-web
refactor/connect-web-market-to-db
chore/1-init-repo
```

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/)-style prefixes so history stays scannable:

| Prefix | Use for |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `refactor:` | Code change that isn't a fix or a feature |
| `perf:` | Performance improvement |
| `docs:` | Documentation only |
| `chore:` | Tooling, deps, config, housekeeping |
| `test:` | Adding or fixing tests |

Scope in parentheses when it helps (`fix(listings): ...`, `feat(sell): ...`). Keep messages in the
imperative mood ("fix category filtering", not "fixed" or "fixes").

### Pull Requests

- Open PRs against `dev`, not `main`.
- Fill out the [PR template](.github/pull_request_template.md) — summary, linked issue, type of change,
  and anything reviewers should know.
- Keep PRs scoped to one feature/fix where possible; call out any known follow-up work in the description.
- Make sure `npm run lint:web` passes before requesting review.

## API Documentation

TBA