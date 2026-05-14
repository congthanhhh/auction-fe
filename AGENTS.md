# Hướng dẫn cho AI Agents - Auction Frontend

> Tài liệu này giúp AI coding agents (Copilot, Claude, v.v.) hiểu rõ về cấu trúc dự án, quy ước code, và những điều cần lưu ý khi phát triển tính năng mới.

## 🎯 Tổng Quan Dự Án

**Tên:** Auction Frontend (auction-fe)  
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS  
**Mục đích:** Ứng dụng web đấu giá trực tuyến với tính năng thanh toán VNPay, quản lý hóa đơn, và giao dịch

### Build & Run Commands
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build production
npm run lint     # Check ESLint errors
npm run preview  # Preview production build
```

---

## 📁 Cấu Trúc Dự Án

```
src/
├── components/        # React components (feature-based + UI primitives)
│   ├── auction/      # Auction-related components
│   ├── auth/         # Authentication components
│   ├── invoice/      # Invoice management components
│   ├── profile/      # User profile components
│   ├── layout/       # Layout components (Header, Footer, MainLayout)
│   ├── ui/           # Shadcn/UI primitive components (Button, Dialog, etc.)
│   └── common/       # Shared components (Pagination, etc.)
├── pages/            # Top-level page components (match routes)
├── services/         # API service layer (Axios-based)
├── stores/           # Global state (Zustand)
├── types/            # TypeScript interfaces & enums
├── hooks/            # Custom React hooks
├── constants/        # App constants (API endpoints, etc.)
├── utils/            # Utility functions
└── lib/              # Library utilities
```

---

## 🏗️ Architectural Patterns

### 1. **Routing (React Router v7)**
- **Entry Point:** [src/App.tsx](src/App.tsx)
- **Pattern:** Layout-based routing with `<Outlet />`
- **MainLayout:** Wraps most routes, includes Header + Footer
- **Auth Routes:** SignIn, SignUp, OAuth callback (no layout)

**Khi thêm route mới:**
- Nếu cần Header/Footer → Add inside `<Route path="/" element={<MainLayout />}>`
- Nếu là auth page → Add outside MainLayout

### 2. **State Management (Zustand)**
**Location:** [src/stores/](src/stores/)

Stores:
- `authStore.ts` - Authentication & user info
- `notificationStore.ts` - Notifications/toasts
- `auctionDetailStore.ts` - Auction detail page state

**Pattern:**
```typescript
// In component:
const { user, isAuthenticated } = useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));
```

⚠️ **Important:** Use `persist` middleware for auth (preserves across refreshes)

### 3. **API Layer (Axios)**
**Location:** [src/services/](src/services/)

- `api.ts` - Axios instance with interceptors (handles token refresh)
- Service files: `auctionService.ts`, `authService.ts`, `invoiceService.ts`, etc.

**Pattern:**
```typescript
export const auctionService = {
  getActive: async (page: number = 1, size: number = 10) => {
    const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE, {
      params: { page, size }
    });
    return response as PageResponse<AuctionSessionResponse>;
  },
};

// In component:
const { data } = await auctionService.getActive();
```

**Key features:**
- Automatic token refresh on 401
- Typed responses (return proper types, not generic `any`)
- All endpoints in [src/constants/api.ts](src/constants/api.ts)

### 4. **Components**
**Naming:** PascalCase + .tsx extension

**Folder organization:**
```
components/
├── auction/          # Auction feature
│   ├── AuctionCard.tsx
│   ├── Detail.tsx    # Main auction detail page
│   └── CreateSessionDialog.tsx
└── auth/
    ├── index.ts      # Export all auth components
    └── OTPDialog.tsx
```

**Pattern - Functional Components:**
```typescript
interface Props {
  auctionId: string;
  onSuccess?: () => void;
}

export function AuctionBidForm({ auctionId, onSuccess }: Props) {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Implementation...
}

export default AuctionBidForm;
```

---

## 🔐 Authentication

**Flow:** See [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)

**Key Points:**
- JWT tokens stored in localStorage (via Zustand persist)
- Refresh token stored in httpOnly cookies (backend handles)
- Token refresh happens automatically via API interceptor
- Protected routes use `useRequireAuth()` hook

**Hook Example:**
```typescript
function MyProtectedComponent() {
  const requireAuth = useRequireAuth();
  
  const handleClick = () => {
    if (requireAuth(() => handleBid())) {
      // User is authenticated, action executed
    }
    // Else: redirected to /signin
  };
}
```

---

## 📋 Types & Constants

### Types
**Location:** [src/types/](src/types/)

- `auction.ts` - Auction status enums & interfaces
- `auth.ts` - Auth DTOs
- `invoice.ts` - Invoice DTOs
- `user.ts` - User interfaces
- `payment.ts` - Payment-related types

**Important:** Use interfaces for data structures (not `type`), enums for constants

### API Endpoints
**Location:** [src/constants/api.ts](src/constants/api.ts)

All API endpoints are centralized here. Update this file when backend adds new endpoints.

---

## 🎨 UI Components (Shadcn/UI)

**Location:** [src/components/ui/](src/components/ui/)

Common patterns:
- `<Button />` - All buttons should use this component (not `<button>`)
- `<Dialog />` - For modals
- `<Input />` - Form inputs
- `<Select />` - Dropdowns
- `<Table />` - Data tables
- `<Badge />` - Status badges
- `<Toast />` - Notifications (via store action)

**Styling:** Tailwind CSS with `clsx` / `cn()` for conditional classes

```typescript
import { cn } from "@/lib/utils";

<Button 
  className={cn("px-4", isActive && "bg-blue-500")}
>
  Click me
</Button>
```

---

## 📡 Real-time Updates (Socket.io)

**Location:** [src/services/socketService.ts](src/services/socketService.ts)

Used for:
- Live auction updates (bid history, status changes)
- Notifications

**Pattern:**
```typescript
import { socketService } from '@/services/socketService';

useEffect(() => {
  socketService.on('auction:updated', (data) => {
    // Handle update
  });

  return () => {
    socketService.off('auction:updated');
  };
}, []);
```

---

## 🚀 Development Workflows

### When Adding a New Feature

1. **Plan the flow** → Use template [MYFLOW.md](MYFLOW.md)
2. **Create types** → [src/types/](src/types/)
3. **Create service** → [src/services/](src/services/) (if calling API)
4. **Create components** → [src/components/](src/components/)
5. **Add route** → [src/App.tsx](src/App.tsx)
6. **Test in browser** → `npm run dev`

### When Creating a Form
- Use React Hook Form or basic `useState`
- Leverage Shadcn/UI `<Input />`, `<Button />`
- Show loading state on submit button
- Display errors in `<Alert />` or inline

### When Handling Async Data
- Use `useState` + `useEffect` for simple cases
- Use Zustand store for global state
- Always handle loading & error states
- Show proper UI feedback (spinner, toast, etc.)

---

## 🧭 Checkpoint Workflow

Use a checkpoint at the end of each working session so the next day can resume fast.

### Khi nào cần checkpoint
- Khi hoàn thành một task trong ngày
- Khi dừng giữa chừng và muốn tiếp tục sau
- Khi bạn đã sửa nhiều file và cần ghi lại trạng thái hiện tại

### Mẫu checkpoint
```text
Checkpoint - [date]
- Done: ...
- In progress: ...
- Files touched: ...
- Next step: ...
- Blockers/notes: ...
```

### Cách dùng
1. Cuối ngày, ghi ngắn gọn 3-5 dòng theo mẫu trên.
2. Lưu checkpoint trong session memory hoặc dán lại vào chat khi quay lại.
3. Ngày hôm sau, nhắn: "Tiếp tục từ checkpoint gần nhất".
4. Nếu có file đang dang dở, nói rõ tên file để agent đi thẳng vào đúng chỗ.

### Cách tôi sẽ tiếp tục khi bạn đưa checkpoint
- Đọc lại phần `Done` và `In progress`
- Mở đúng file liên quan
- Tiếp tục từ `Next step`
- Nếu checkpoint thiếu thông tin, tôi sẽ hỏi tối đa 1 câu làm rõ

---

## ⚠️ Common Pitfalls

1. **Don't make untyped API calls** → Always define types in `src/types/`
2. **Don't duplicate endpoints** → Use `src/constants/api.ts`
3. **Don't bypass the Axios instance** → Use `import { api }` from `src/services/api.ts`
4. **Don't hardcode API URLs** → Use `API_ENDPOINTS` constants
5. **Don't use `require()`** → Use ES6 imports
6. **Don't forget error handling** → Always display errors to user

---

## 📚 Documentation Files

Refer to these for specific topics:
- [API_WORKFLOW.md](API_WORKFLOW.md) - API structure & patterns
- [MYFLOW.md](MYFLOW.md) - Feature planning template
- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - Auth flow details
- [ENDPOINT.md](ENDPOINT.md) - All available API endpoints
- [package.json](package.json) - Dependencies & scripts

---

## 🔧 ESLint Configuration

- Configured in [eslint.config.js](eslint.config.js)
- Run `npm run lint` to check errors
- Fix auto-fixable: `npm run lint -- --fix`

Common rules:
- No console logs in production (remove or use if needed)
- No unused variables
- React hooks must follow rules

---

## 🤝 Best Practices

1. **Type Everything** - Use TypeScript strictly
2. **Keep Components Small** - Max 200-300 lines, extract logic
3. **Use Constants** - No magic numbers/strings
4. **Error Handling** - Always try/catch, display to user
5. **Accessibility** - Use semantic HTML, ARIA labels
6. **Mobile First** - Design responsive with Tailwind
7. **Performance** - Avoid inline functions, use `useCallback`

---

**Last Updated:** May 2026  
**Maintained by:** Development Team
