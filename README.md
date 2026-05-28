# Repo Scaffold

## Architecture

This repository follows a feature-driven architecture with container/presentational boundaries.

- `apps/mobile/src` is organized for the React Native app.
- `apps/web/src` is organized for the Next.js app and backend routes.
- Feature code lives under `src/features/[feature-name]`.
- Shared application code lives in platform folders such as `components`, `lib`, `queries`, `store`, `providers`, `config`, `styles`, `types`, and `tests`.

## Naming Conventions

- PascalCase for Components and Containers
- camelCase for hooks and stores
- dot-case for services, queries, and types
- kebab-case for folders
