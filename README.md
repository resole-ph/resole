# Repo Scaffold

## Overview

`resole` is a monorepo with two apps under `apps/`:

- `apps/web` for the Next.js app
- `apps/mobile` for the Expo / React Native app

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

## Run From Root

Start the project from the repository root with these commands:

```powershell
npm run dev:web
npm run dev:mobile
```

Additional root scripts are available:

- `npm run build:web`
- `npm run start:web`
- `npm run lint:web`
- `npm run android:mobile`
- `npm run ios:mobile`
- `npm run web:mobile`

Run the two dev commands in separate terminals if you want both apps active at the same time.
