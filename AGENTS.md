# AI Agent Guide - Auction Frontend

> This document helps AI coding agents understand the project structure, coding conventions, and important development rules for this repository.

## Project Overview

**Name:** Auction Frontend (`auction-fe`)  
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS  
**Purpose:** Online auction web application with VNPay payment, invoice management, auction sessions, and transaction workflows.

### Build & Run Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build production
npm run lint     # Check ESLint errors
npm run preview  # Preview production build
```

If PowerShell blocks `npm.ps1`, use `npm.cmd`, for example:

```bash
npm.cmd run build
```

## Language Rule

- All future agent rules, project guidance, and custom skills must be written in English.
- User-facing UI copy may be written in Vietnamese when the product experience requires Vietnamese.
- Code identifiers, comments, and documentation should default to English unless existing local context clearly uses another language.

## Clarification Rule

- If an agent does not understand a requirement, is not sure how an API contract should be mapped, or notices missing request/response data needed to implement the task correctly, the agent must ask the user immediately before making assumptions.
- Do not invent backend fields, endpoint behavior, or workflow rules when they are not present in local documentation or code.

## Project Structure

```text
src/
+-- components/        # React components (feature-based + UI primitives)
|   +-- auction/       # Auction-related components
|   +-- auth/          # Authentication components
|   +-- invoice/       # Invoice management components
|   +-- profile/       # User profile components
|   +-- layout/        # Layout components (Header, Footer, MainLayout)
|   +-- ui/            # Shadcn/UI primitive components (Button, Dialog, etc.)
|   +-- common/        # Shared components (Pagination, etc.)
+-- pages/             # Top-level page components (route targets)
+-- services/          # API service layer (Axios-based)
+-- stores/            # Global state (Zustand)
+-- types/             # TypeScript interfaces and enums/constants
+-- hooks/             # Custom React hooks
+-- constants/         # App constants, API endpoints, etc.
+-- utils/             # Utility functions
+-- lib/               # Library utilities
```

## Architectural Patterns

### 1. Routing (React Router v7)

- **Entry point:** [src/App.tsx](src/App.tsx)
- **Pattern:** Layout-based routing with `<Outlet />`
- **MainLayout:** Wraps most routes and includes Header + Footer
- **Auth routes:** SignIn, SignUp, OAuth callback use no layout

When adding a new route:

- If it needs Header/Footer, add it inside `<Route path="/" element={<MainLayout />}>`.
- If it is an auth-only page, add it outside `MainLayout`.

### 2. State Management (Zustand)

**Location:** [src/stores/](src/stores/)

Stores:

- `authStore.ts` - Authentication and user information
- `notificationStore.ts` - Notifications/toasts
- `auctionDetailStore.ts` - Auction detail page state

Pattern:

```typescript
const { user, isAuthenticated } = useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));
```

Important:

- Use `persist` middleware for auth state so login survives refreshes.
- Keep shared state in Zustand only when it is actually shared across views.

### 3. API Layer (Axios)

**Location:** [src/services/](src/services/)

- `api.ts` - Axios instance with interceptors, including token refresh handling.
- Service files: `auctionService.ts`, `authService.ts`, `invoiceService.ts`, etc.

Pattern:

```typescript
export const auctionService = {
  getActive: async (
    page: number = 1,
    size: number = 10,
  ): Promise<PageResponse<AuctionSessionResponse>> => {
    const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE, {
      params: { page, size },
    });

    return response as PageResponse<AuctionSessionResponse>;
  },
};
```

Key rules:

- Use the shared `api` instance from [src/services/api.ts](src/services/api.ts).
- Use endpoint constants from [src/constants/api.ts](src/constants/api.ts).
- Return typed responses. Avoid generic `any`.
- Handle loading, error, and empty states in the UI.

### 4. Components

**Naming:** PascalCase with `.tsx` extension.

Example organization:

```text
components/
+-- auction/
|   +-- AuctionCard.tsx
|   +-- Detail.tsx
|   +-- CreateSessionDialog.tsx
+-- auth/
    +-- index.ts
    +-- OTPDialog.tsx
```

Component pattern:

```typescript
interface Props {
  auctionId: string;
  onSuccess?: () => void;
}

export function AuctionBidForm({ auctionId, onSuccess }: Props) {
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Implementation...
}

export default AuctionBidForm;
```

## Authentication

**Flow:** See [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)

Key points:

- JWT tokens are stored in localStorage via Zustand persist.
- Refresh token is stored in httpOnly cookies and handled by the backend.
- Token refresh happens automatically through the API interceptor.
- Protected actions use the `useRequireAuth()` hook.

Hook example:

```typescript
function MyProtectedComponent() {
  const requireAuth = useRequireAuth();

  const handleClick = () => {
    if (requireAuth(() => handleBid())) {
      // User is authenticated and action executed.
    }
  };
}
```

## Types & Constants

### Types

**Location:** [src/types/](src/types/)

- `auction.ts` - Auction status constants and interfaces
- `auth.ts` - Auth DTOs
- `invoice.ts` - Invoice DTOs
- `user.ts` - User interfaces
- `payment.ts` - Payment-related types

Rules:

- Use `interface` for data structures.
- Use constants/enums for fixed values.
- Match backend DTOs as closely as possible.
- Export types that cross module boundaries.

### API Endpoints

**Location:** [src/constants/api.ts](src/constants/api.ts)

All API endpoints are centralized here. Update this file when the backend adds or changes endpoints.

## UI Components (Shadcn/UI)

**Location:** [src/components/ui/](src/components/ui/)

Common patterns:

- Use `<Button />` instead of raw `<button>` for app actions.
- Use `<Dialog />` for modals.
- Use `<Input />` for form inputs.
- Use `<Select />` for dropdowns.
- Use `<Table />` for data tables.
- Use `<Badge />` for statuses.
- Use notification store actions for toasts/messages when available.

Styling:

```typescript
import { cn } from "@/lib/utils";

<Button className={cn("px-4", isActive && "bg-blue-500")}>
  Click me
</Button>;
```

## Real-time Updates (Socket.io)

**Location:** [src/services/socketService.ts](src/services/socketService.ts)

Used for:

- Live auction updates, including bids and status changes
- Notifications

Pattern:

```typescript
import { socketService } from "@/services/socketService";

useEffect(() => {
  socketService.on("auction:updated", (data) => {
    // Handle update.
  });

  return () => {
    socketService.off("auction:updated");
  };
}, []);
```

## Development Workflow

### When Adding a New Feature

1. Plan the flow. Use [MYFLOW.md](MYFLOW.md) as a template if needed.
2. Create or update types in [src/types/](src/types/).
3. Create or update service methods in [src/services/](src/services/) if the feature calls APIs.
4. Create focused components under [src/components/](src/components/).
5. Add or update routes in [src/App.tsx](src/App.tsx).
6. Test in browser with `npm run dev`.
7. Run targeted lint/build checks when possible.

### When Creating a Form

- Use React Hook Form or local `useState`, following nearby code patterns.
- Use Shadcn/UI `<Input />`, `<Button />`, `<Select />`, etc.
- Show loading state on submit.
- Display validation and API errors near the form.
- Keep submit handlers typed and avoid `any`.

### When Handling Async Data

- Use `useState` + `useEffect` for local/simple data.
- Use Zustand only for shared global state.
- Always handle loading, error, and empty states.
- Show useful feedback: spinner, empty message, toast, or inline error.
- Clean up subscriptions and socket listeners.

## Checkpoint Workflow

Use a checkpoint at the end of a working session so the next session can resume quickly.

### When to create a checkpoint

- After completing a task.
- When pausing in the middle of a larger task.
- When multiple files were changed and the current state should be recorded.

### Checkpoint template

```text
Checkpoint - [date]
- Done: ...
- In progress: ...
- Files touched: ...
- Next step: ...
- Blockers/notes: ...
```

### How to resume from a checkpoint

1. Read `Done` and `In progress`.
2. Open the files listed under `Files touched`.
3. Continue from `Next step`.
4. Ask at most one clarifying question if the checkpoint is missing critical context.

## Common Pitfalls

1. Do not make untyped API calls. Define types in `src/types/`.
2. Do not duplicate endpoints. Use `src/constants/api.ts`.
3. Do not bypass the Axios instance. Use `import { api } from "@/services/api"`.
4. Do not hardcode API URLs in components.
5. Do not use `require()`. Use ES module imports.
6. Do not ignore error handling. Display errors to the user.
7. Do not add broad abstractions unless they match existing project patterns.

## Documentation Files

Refer to these files for specific topics:

- [API_WORKFLOW.md](API_WORKFLOW.md) - API structure and patterns
- [MYFLOW.md](MYFLOW.md) - Feature planning template
- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - Auth flow details
- [ENDPOINT.md](ENDPOINT.md) - Available API endpoints
- [package.json](package.json) - Dependencies and scripts

## ESLint Configuration

- Configured in [eslint.config.js](eslint.config.js)
- Run `npm run lint` to check errors
- Auto-fix where safe with `npm run lint -- --fix`

Common rules:

- Remove unused variables.
- Follow React Hooks rules.
- Avoid `any` unless there is a documented reason.

## Best Practices

1. Type everything with TypeScript.
2. Keep components small and focused. Extract logic when components grow too large.
3. Use constants instead of magic strings/numbers.
4. Use `try/catch` for async actions and show user-facing feedback.
5. Build accessible UI with semantic HTML and ARIA labels where needed.
6. Design mobile-first with Tailwind.
7. Prefer existing project patterns over new abstractions.
8. Use `lucide-react` icons for actions when a matching icon exists.

---

**Last Updated:** May 2026  
**Maintained by:** Development Team
