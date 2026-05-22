# AI Agent Guide - Auction Frontend

Concise rules for working in `auction-fe`, a React 19 + TypeScript + Vite + Tailwind CSS online auction frontend with VNPay payment, invoices, auction sessions, and transaction workflows.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

If PowerShell blocks `npm.ps1`, use `npm.cmd`, for example `npm.cmd run build`.

## Non-Negotiable Rules

- Write agent rules, project guidance, custom skills, code identifiers, comments, and docs in English unless local context clearly requires otherwise.
- UI copy may be Vietnamese when it fits the product experience.
- Ask the user before assuming unclear requirements, API mappings, request/response shapes, endpoint behavior, or workflow rules.
- Do not invent backend fields or undocumented behavior.
- Ask for explicit confirmation before deleting any file, including generated, duplicate, unused, config, asset, source, or documentation files.

## Project Structure

```text
src/
+-- components/   # Feature components and UI primitives
|   +-- auction/  # Auction UI
|   +-- auth/     # Authentication UI
|   +-- invoice/  # Invoice UI
|   +-- profile/  # User profile UI
|   +-- layout/   # Header, Footer, MainLayout
|   +-- ui/       # Shadcn/UI primitives
|   +-- common/   # Shared components
+-- pages/        # Route targets
+-- services/     # Axios API layer
+-- stores/       # Zustand stores
+-- types/        # DTOs, interfaces, constants/enums
+-- hooks/        # Custom hooks
+-- constants/    # API endpoints and app constants
+-- utils/        # Utilities
+-- lib/          # Library helpers
```

## Core Architecture

- Routing lives in [src/App.tsx](src/App.tsx) with React Router v7 and layout-based routes.
- Add pages needing Header/Footer inside `<Route path="/" element={<MainLayout />}>`; keep auth-only pages outside `MainLayout`.
- Shared state uses Zustand in [src/stores/](src/stores/). Keep state local unless it is reused across views.
- Auth state is persisted with Zustand; JWT lives in localStorage and refresh token handling is backend/cookie based.
- Protected actions should use the existing `useRequireAuth()` pattern.
- Real-time auction and notification updates use [src/services/socketService.ts](src/services/socketService.ts). Always clean up socket listeners in effects.

## API, Types, and Constants

- Use the shared Axios instance from [src/services/api.ts](src/services/api.ts).
- Put endpoint paths in [src/constants/api.ts](src/constants/api.ts); do not hardcode API URLs in components.
- Put cross-module DTOs and fixed values in [src/types/](src/types/).
- Prefer `interface` for data structures and constants/enums for fixed values.
- Return typed service responses and avoid `any` unless there is a documented reason.
- Match backend DTOs as closely as possible.
- Handle loading, error, and empty states wherever async data appears.

## Components and UI

- Use PascalCase `.tsx` files for components.
- Keep components focused; extract logic only when it reduces real complexity or follows an existing pattern.
- Use Shadcn/UI primitives from [src/components/ui/](src/components/ui/) for buttons, dialogs, inputs, selects, tables, badges, and similar controls.
- Use `cn` from [src/lib/utils](src/lib/utils) for conditional class names.
- Use `lucide-react` icons for actions when a suitable icon exists.
- Build accessible, mobile-first UI with semantic HTML and useful feedback for async actions.
- Forms should follow nearby patterns, use typed submit handlers, show submit loading, and display validation/API errors near the relevant fields.

## Feature Workflow

1. Understand the flow; use [MYFLOW.md](MYFLOW.md) as a planning template when useful.
2. Add or update types in [src/types/](src/types/).
3. Add or update endpoints in [src/constants/api.ts](src/constants/api.ts).
4. Add or update service methods in [src/services/](src/services/).
5. Build focused components in [src/components/](src/components/) and pages in [src/pages/](src/pages/).
6. Add or update routes in [src/App.tsx](src/App.tsx).
7. Test in browser with `npm run dev` when UI behavior is involved.
8. Run targeted lint/build checks when practical.

## Quality Checklist

- Type everything with TypeScript.
- Use ES module imports; do not use `require()`.
- Use constants instead of magic strings or numbers.
- Use `try/catch` for async actions and show user-facing errors.
- Remove unused variables and follow React Hooks rules.
- Prefer existing project patterns over new abstractions.
- Do not bypass the shared API layer or duplicate endpoints.

## Checkpoints

Create a checkpoint after completing a task, pausing mid-task, or changing multiple files.

```text
Checkpoint - [date] 
- Done: ...
- In progress: ...
- Files touched: ...
- Next step: ...
- Blockers/notes: ...
```

To resume, read the checkpoint, open touched files, continue from `Next step`, and ask at most one clarifying question if critical context is missing.

## Reference Docs

- [API_WORKFLOW.md](API_WORKFLOW.md) - API structure and patterns
- [MYFLOW.md](MYFLOW.md) - Feature planning template
- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - Auth flow details
- [ENDPOINT.md](ENDPOINT.md) - Available API endpoints
- [package.json](package.json) - Dependencies and scripts
- [eslint.config.js](eslint.config.js) - ESLint configuration

---

**Last Updated:** May 2026  
**Maintained by:** Development Team
