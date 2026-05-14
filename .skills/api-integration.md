---
name: api-integration
description: Create and integrate API calls in components following project conventions
applyTo: ['**/*.tsx', '**/*.ts']
---

# API Integration Skill

> Giúp AI agents tạo và tích hợp API calls một cách đúng cách theo quy ước của project.

## 🎯 Mục Đích

Khi cần implement các tính năng yêu cầu gọi API từ frontend, skill này đảm bảo:
- ✅ API calls được tổ chức trong service layer
- ✅ Tất cả responses được type-safe
- ✅ Endpoints được centralize
- ✅ Error handling & loading states
- ✅ Token refresh tự động (via interceptor)

---

## 📋 Quy Trình Step-by-Step

### **Step 1: Define Types** (src/types/)
Tạo hoặc update TypeScript interfaces cho request/response

```typescript
// src/types/auction.ts
export interface AuctionSessionRequest {
  productId: number;
  startPrice: number;
  duration: number;
}

export interface AuctionSessionResponse {
  id: string;
  productId: number;
  status: AuctionStatus;
  // ...
}
```

✅ **Checklist:**
- [ ] Use `interface` (not `type`) for data structures
- [ ] Use `enum` or constants for fixed values (see `AuctionStatus`)
- [ ] Export types that cross modules
- [ ] Match backend DTO exactly

---

### **Step 2: Add API Endpoint** (src/constants/api.ts)
Thêm endpoint vào centralized config

```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  AUCTION: {
    ACTIVE: '/auction/sessions/active',
    ACTIVE_DESC: '/auction/sessions/active-desc',
    DETAIL: (id: string) => `/auction/sessions/${id}`,
    CREATE: '/auction/sessions',
    UPDATE: (id: string) => `/auction/sessions/${id}`,
  },
  // ...other endpoints
};
```

✅ **Checklist:**
- [ ] Endpoint string starts with `/`
- [ ] Use function for parameterized URLs
- [ ] Group by resource (AUCTION, INVOICE, etc.)
- [ ] Never hardcode URLs in components

---

### **Step 3: Create Service Method** (src/services/)
Implement service method trong file service tương ứng

```typescript
// src/services/auctionService.ts
import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type { AuctionSessionResponse, PageResponse } from '@/types/auction';

export const auctionService = {
  // GET single item
  getDetail: async (id: string): Promise<AuctionSessionResponse> => {
    const response = await api.get(API_ENDPOINTS.AUCTION.DETAIL(id));
    return response as AuctionSessionResponse;
  },

  // GET list with pagination
  getActive: async (page: number = 1, size: number = 10): Promise<PageResponse<AuctionSessionResponse>> => {
    const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE, {
      params: { page, size },
    });
    return response as PageResponse<AuctionSessionResponse>;
  },

  // POST create
  create: async (data: AuctionSessionRequest): Promise<AuctionSessionResponse> => {
    const response = await api.post(API_ENDPOINTS.AUCTION.CREATE, data);
    return response as AuctionSessionResponse;
  },

  // PUT update
  update: async (id: string, data: Partial<AuctionSessionRequest>): Promise<AuctionSessionResponse> => {
    const response = await api.put(API_ENDPOINTS.AUCTION.UPDATE(id), data);
    return response as AuctionSessionResponse;
  },

  // DELETE
  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.AUCTION.UPDATE(id));
  },
};
```

✅ **Checklist:**
- [ ] Use `api` instance (from `src/services/api.ts`)
- [ ] All methods return typed responses
- [ ] Params passed via `params:` object
- [ ] Return type is explicitly defined
- [ ] No `any` types

---

### **Step 4: Use in Component** (src/components/ or src/pages/)
Gọi service method từ component

```typescript
// src/components/auction/Detail.tsx
import { useEffect, useState } from 'react';
import { auctionService } from '@/services/auctionService';
import type { AuctionSessionResponse } from '@/types/auction';
import { useRequireAuth } from '@/hooks/use-require-auth';

export function AuctionDetail({ auctionId }: { auctionId: string }) {
  const [auction, setAuction] = useState<AuctionSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requireAuth = useRequireAuth();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await auctionService.getDetail(auctionId);
        setAuction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load auction');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId]);

  // Handle async action requiring auth
  const handleBid = async (amount: number) => {
    if (!requireAuth()) return; // Redirect if not authenticated

    try {
      setLoading(true);
      const result = await bidService.placeBid(auctionId, amount);
      // Show success
      useNotificationStore.setState({
        message: 'Bid placed successfully!',
        type: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!auction) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <h1>{auction.productId}</h1>
      {/* Render auction data */}
      <button onClick={() => handleBid(100)}>Place Bid</button>
    </div>
  );
}
```

✅ **Checklist:**
- [ ] Import service from `src/services/`
- [ ] Import types from `src/types/`
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Show user feedback (loading spinner, error message, success toast)
- [ ] Use `useRequireAuth()` for protected actions
- [ ] Async calls in `useEffect` or event handlers
- [ ] Cleanup function if needed (return in useEffect)

---

## 🔍 Common API Patterns

### Pattern 1: Fetch List with Pagination
```typescript
// Service
getList: async (page: number, size: number) => {
  const response = await api.get(API_ENDPOINTS.MY.LIST, {
    params: { page, size },
  });
  return response as PageResponse<MyItem>;
};

// Component
const [items, setItems] = useState<MyItem[]>([]);
const [page, setPage] = useState(1);

useEffect(() => {
  (async () => {
    const data = await myService.getList(page, 10);
    setItems(data.content);
  })();
}, [page]);
```

### Pattern 2: Create with Request Payload
```typescript
// Service
create: async (data: CreateRequest): Promise<CreateResponse> => {
  const response = await api.post(API_ENDPOINTS.CREATE, data);
  return response as CreateResponse;
};

// Component
const handleCreate = async (formData: CreateRequest) => {
  try {
    const result = await myService.create(formData);
    showSuccessToast('Created successfully');
    refresh(); // Refresh list
  } catch (err) {
    showErrorToast(err.message);
  }
};
```

### Pattern 3: Search/Filter
```typescript
// Service
search: async (query: string, filters?: FilterOptions): Promise<SearchResult[]> => {
  const response = await api.get(API_ENDPOINTS.SEARCH, {
    params: { q: query, ...filters },
  });
  return response as SearchResult[];
};

// Component
const [query, setQuery] = useState('');
const [results, setResults] = useState<SearchResult[]>([]);

const handleSearch = useCallback(async (value: string) => {
  setQuery(value);
  if (!value.trim()) {
    setResults([]);
    return;
  }
  const data = await myService.search(value);
  setResults(data);
}, []);
```

### Pattern 4: Upload File
```typescript
// Service
uploadImage: async (file: File): Promise<ImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(API_ENDPOINTS.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response as ImageResponse;
};

// Component
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await imageService.uploadImage(file);
    setImageUrl(result.url);
  } catch (err) {
    showErrorToast('Upload failed');
  }
};
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Call API directly in component
```typescript
// WRONG!
const response = await fetch('/api/auction/123');
```

### ✅ DO: Use service layer
```typescript
// CORRECT
const auction = await auctionService.getDetail('123');
```

---

### ❌ DON'T: Hardcode endpoint URLs
```typescript
// WRONG!
const response = await api.get('/api/auction/active');
```

### ✅ DO: Use API_ENDPOINTS constants
```typescript
// CORRECT
const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE);
```

---

### ❌ DON'T: Use `any` types
```typescript
// WRONG!
const response = await api.get(url);
return response as any;
```

### ✅ DO: Define proper types
```typescript
// CORRECT
const response = await api.get(url);
return response as AuctionSessionResponse;
```

---

### ❌ DON'T: Ignore loading/error states
```typescript
// WRONG!
const [data, setData] = useState(null);
useEffect(() => {
  auctionService.getDetail(id).then(setData);
}, [id]);
```

### ✅ DO: Handle all states
```typescript
// CORRECT
const [data, setData] = useState<Auction | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  (async () => {
    try {
      const result = await auctionService.getDetail(id);
      setData(result);
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  })();
}, [id]);
```

---

## 📚 Reference Files

- [AGENTS.md](../AGENTS.md) - Full project guide
- [API_WORKFLOW.md](../API_WORKFLOW.md) - API patterns
- [src/constants/api.ts](../src/constants/api.ts) - Endpoints
- [src/services/auctionService.ts](../src/services/auctionService.ts) - Service example
- [src/types/auction.ts](../src/types/auction.ts) - Types example

---

## 🚀 Quick Checklist When Implementing API Feature

- [ ] Types defined in `src/types/`
- [ ] Endpoint added to `src/constants/api.ts`
- [ ] Service method created in `src/services/`
- [ ] Component imports service + types
- [ ] Loading state handled
- [ ] Error state handled
- [ ] User feedback (toast/message)
- [ ] All responses typed (no `any`)
- [ ] Query params via `params:` object
- [ ] Protected actions use `useRequireAuth()`
- [ ] No hardcoded URLs or endpoints

---

**Last Updated:** May 2026
