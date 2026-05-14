---
name: api-integration
description: Create and integrate API calls in components following project conventions
applyTo: ['**/*.tsx', '**/*.ts']
---

# API Integration Skill

> Use this skill when implementing frontend features that call backend APIs. Keep the API layer typed, centralized, and consistent with this project.

## Purpose

This skill ensures that API integrations follow the project conventions:

- API calls live in the service layer.
- Request and response data are type-safe.
- Endpoints are centralized.
- Components handle loading, error, success, and empty states.
- Token refresh is handled by the shared Axios interceptor.

## Language Rule

- All future agent rules, project guidance, and custom skills must be written in English.
- User-facing UI copy may still be Vietnamese when appropriate for the product.

## Clarification Rule

- If the API contract is missing required request or response fields, ask the user immediately before implementing.
- Do not invent endpoint behavior, response fields, or mapping rules that are not present in local documentation or code.
- If a UI requirement depends on data that the documented API does not return, stop and ask for the intended endpoint or response shape.

## Step-by-Step Workflow

### Step 1: Define Types (`src/types/`)

Create or update TypeScript interfaces for request and response DTOs.

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
}
```

Checklist:

- [ ] Use `interface` for data structures.
- [ ] Use constants/enums for fixed values, such as `AuctionStatus`.
- [ ] Export types that are used across modules.
- [ ] Match backend DTOs as closely as possible.
- [ ] Avoid `any`.

### Step 2: Add API Endpoint (`src/constants/api.ts`)

Add the endpoint to the centralized endpoint config.

```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  AUCTION: {
    ACTIVE: "/auction/sessions/active",
    ACTIVE_DESC: "/auction/sessions/active-desc",
    DETAIL: (id: string) => `/auction/sessions/${id}`,
    CREATE: "/auction/sessions",
    UPDATE: (id: string) => `/auction/sessions/${id}`,
  },
};
```

Checklist:

- [ ] Endpoint strings start with `/`.
- [ ] Use functions for parameterized URLs.
- [ ] Group endpoints by resource, such as `AUCTION`, `INVOICE`, `PRODUCT`, or `USER`.
- [ ] Never hardcode endpoint URLs inside components.

### Step 3: Create Service Method (`src/services/`)

Implement the API call in the relevant service file.

```typescript
// src/services/auctionService.ts
import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  AuctionSessionRequest,
  AuctionSessionResponse,
  PageResponse,
} from "@/types/auction";

export const auctionService = {
  getDetail: async (id: string): Promise<AuctionSessionResponse> => {
    const response = await api.get(API_ENDPOINTS.AUCTION.DETAIL(id));
    return response as AuctionSessionResponse;
  },

  getActive: async (
    page: number = 1,
    size: number = 10,
  ): Promise<PageResponse<AuctionSessionResponse>> => {
    const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE, {
      params: { page, size },
    });
    return response as PageResponse<AuctionSessionResponse>;
  },

  create: async (
    data: AuctionSessionRequest,
  ): Promise<AuctionSessionResponse> => {
    const response = await api.post(API_ENDPOINTS.AUCTION.CREATE, data);
    return response as AuctionSessionResponse;
  },

  update: async (
    id: string,
    data: Partial<AuctionSessionRequest>,
  ): Promise<AuctionSessionResponse> => {
    const response = await api.put(API_ENDPOINTS.AUCTION.UPDATE(id), data);
    return response as AuctionSessionResponse;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.AUCTION.UPDATE(id));
  },
};
```

Checklist:

- [ ] Use the shared `api` instance from `src/services/api.ts`.
- [ ] Use `API_ENDPOINTS`.
- [ ] Return typed responses.
- [ ] Pass query parameters through the `params` option.
- [ ] Define explicit return types.
- [ ] Avoid `any`.

### Step 4: Use the Service in a Component (`src/components/` or `src/pages/`)

Call the service method from the component, not from raw `fetch` or hardcoded URLs.

```typescript
import { useEffect, useState } from "react";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse } from "@/types/auction";
import { useRequireAuth } from "@/hooks/use-require-auth";

export function AuctionDetail({ auctionId }: { auctionId: string }) {
  const [auction, setAuction] = useState<AuctionSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requireAuth = useRequireAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchAuction = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await auctionService.getDetail(auctionId);
        if (isMounted) setAuction(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load auction");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuction();

    return () => {
      isMounted = false;
    };
  }, [auctionId]);

  const handleBid = async (amount: number) => {
    if (!requireAuth()) return;

    try {
      setLoading(true);
      // await bidService.placeBid(auctionId, { amount });
      // Show success feedback and refresh local data if needed.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
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
      <button type="button" onClick={() => handleBid(100)}>
        Place Bid
      </button>
    </div>
  );
}
```

Checklist:

- [ ] Import service methods from `src/services/`.
- [ ] Import DTOs from `src/types/`.
- [ ] Handle loading state.
- [ ] Handle error state.
- [ ] Handle empty state.
- [ ] Show user feedback, such as spinner, inline message, or toast.
- [ ] Use `useRequireAuth()` for protected actions.
- [ ] Put async calls in `useEffect` or event handlers.
- [ ] Clean up effects when the component can unmount during a request.

## Common API Patterns

### Pattern 1: Fetch List with Pagination

```typescript
// Service
getList: async (
  page: number,
  size: number,
): Promise<PageResponse<MyItem>> => {
  const response = await api.get(API_ENDPOINTS.MY.LIST, {
    params: { page, size },
  });
  return response as PageResponse<MyItem>;
};

// Component
const [items, setItems] = useState<MyItem[]>([]);
const [page, setPage] = useState(1);

useEffect(() => {
  let isMounted = true;

  const fetchItems = async () => {
    const data = await myService.getList(page, 10);
    if (isMounted) setItems(data.data);
  };

  fetchItems();

  return () => {
    isMounted = false;
  };
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
    showSuccessToast("Created successfully");
    refresh();
  } catch (err) {
    showErrorToast(err instanceof Error ? err.message : "Create failed");
  }
};
```

### Pattern 3: Search or Filter

```typescript
// Service
search: async (
  query: string,
  filters?: FilterOptions,
): Promise<SearchResult[]> => {
  const response = await api.get(API_ENDPOINTS.SEARCH, {
    params: { q: query, ...filters },
  });
  return response as SearchResult[];
};

// Component
const [query, setQuery] = useState("");
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
  formData.append("file", file);

  const response = await api.post(API_ENDPOINTS.UPLOAD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response as ImageResponse;
};

// Component
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const result = await imageService.uploadImage(file);
    setImageUrl(result.url);
  } catch {
    showErrorToast("Upload failed");
  }
};
```

## Common Mistakes to Avoid

### Do not call APIs directly in components

```typescript
// Wrong
const response = await fetch("/api/auction/123");
```

```typescript
// Correct
const auction = await auctionService.getDetail("123");
```

### Do not hardcode endpoint URLs

```typescript
// Wrong
const response = await api.get("/api/auction/active");
```

```typescript
// Correct
const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE);
```

### Do not use `any`

```typescript
// Wrong
const response = await api.get(url);
return response as any;
```

```typescript
// Correct
const response = await api.get(url);
return response as AuctionSessionResponse;
```

### Do not ignore loading and error states

```typescript
// Wrong
const [data, setData] = useState(null);
useEffect(() => {
  auctionService.getDetail(id).then(setData);
}, [id]);
```

```typescript
// Correct
const [data, setData] = useState<Auction | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const result = await auctionService.getDetail(id);
      if (isMounted) setData(result);
    } catch {
      if (isMounted) setError("Failed to load");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, [id]);
```

## Reference Files

- [AGENTS.md](../AGENTS.md) - Full project guide
- [API_WORKFLOW.md](../API_WORKFLOW.md) - API patterns
- [src/constants/api.ts](../src/constants/api.ts) - Endpoint constants
- [src/services/auctionService.ts](../src/services/auctionService.ts) - Service example
- [src/types/auction.ts](../src/types/auction.ts) - Type example

## Quick Checklist When Implementing an API Feature

- [ ] Types are defined in `src/types/`.
- [ ] Endpoint is added to `src/constants/api.ts`.
- [ ] Service method is created in `src/services/`.
- [ ] Component imports service and types.
- [ ] Loading state is handled.
- [ ] Error state is handled.
- [ ] Empty state is handled.
- [ ] User feedback is shown.
- [ ] All responses are typed.
- [ ] Query params use the `params` option.
- [ ] Protected actions use `useRequireAuth()`.
- [ ] No hardcoded URLs or endpoints.

---

**Last Updated:** May 2026
