# API ENDPOINT Documentation

## Address

### Create Address
- **POST** `/address`
- **Action:** createAddress  
- **Request Body:** AddressRequest (validated)  
- **Response:** AddressResponse (200 OK)

### Get My Addresses
- **GET** `/address`
- **Action:** getMyAddresses  
- **Response:** List<AddressResponse> (200 OK)

### Get Address by ID
- **GET** `/address/{id}`
- **Action:** getAddress  
- **Path Param:** id (Long)  
- **Response:** AddressResponse (200 OK)

### Update Address
- **PUT** `/address/{id}`
- **Action:** updateAddress  
- **Path Param:** id (Long)  
- **Request Body:** AddressRequest (validated)  
- **Response:** AddressResponse (200 OK)

### Set Default Address
- **PATCH** `/address/{id}/default`
- **Action:** setDefaultAddress  
- **Path Param:** id (Long)  
- **Response:** MessageResponse (200 OK)  
- **Message:** "Đặt địa chỉ mặc định thành công."

### Delete Address
- **DELETE** `/address/{id}`
- **Action:** deleteAddress  
- **Path Param:** id (Long)  
- **Response:** String (200 OK)  
- **Message:** "Address deleted successfully"


---

## AuctionSession

### Create Auction Session
- **POST** `/auction-sessions`
- **Action:** create auction session  
- **Body:** @Valid AuctionSessionRequest + HttpServletRequest  
- **Response:** CreateAuctionSessionResponse  

### Get Joined Sessions
- **GET** `/auction-sessions/my-joined`
- **Action:** get sessions the user joined  
- **Query Params:**  
  - page (default: 1)  
  - size (default: 10)  
  - status (optional: AuctionStatus)  
- **Response:** PageResponse<AuctionSessionResponse>  

### Get Active Sessions by Seller
- **GET** `/auction-sessions/seller/{sellerId}/active`
- **Action:** get active sessions by seller  
- **Path Param:** sellerId (String)  
- **Query Params:** page, size  
- **Response:** PageResponse<AuctionSessionResponse>  

### List Auction Sessions
- **GET** `/auction-sessions`
- **Action:** list auction sessions  
- **Query Params:**  
  - status (optional)  
  - page (default: 1)  
  - size (default: 10)  
- **Response:** PageResponse<AuctionSessionResponse>  

### Top Popular Sessions
- **GET** `/auction-sessions/top-popular`
- **Action:** top popular sessions  
- **Response:** List<AuctionSessionResponse>  

### Get My Sessions
- **GET** `/auction-sessions/my-sessions`
- **Action:** sessions created by current user  
- **Query Params:** status (optional), page, size  
- **Response:** PageResponse<AuctionSessionResponse>  

### Get Session by ID
- **GET** `/auction-sessions/{id}`
- **Action:** get session by id  
- **Path Param:** id (Long)  
- **Response:** AuctionSessionResponse  

### Active Sessions (Descending)
- **GET** `/auction-sessions/active-desc`
- **Action:** active sessions, descending  
- **Query Params:** page, size  
- **Response:** PageResponse<AuctionSessionResponse>  

### Scheduled Sessions (Descending)
- **GET** `/auction-sessions/schedule-desc`
- **Action:** scheduled sessions, descending  
- **Query Params:** page, size  
- **Response:** PageResponse<AuctionSessionResponse>  

### Buy Now
- **POST** `/auction-sessions/{id}/buy-now`
- **Action:** buy now for session  
- **Path Param:** id (Long)  
- **Response:** InvoiceResponse  

### Cancel Session
- **PUT** `/auction-sessions/{id}/cancel`
- **Action:** cancel/stop session by user  
- **Path Param:** id (Long)  
- **Response:** AuctionSessionResponse  

### Reactivate Session
- **PUT** `/auction-sessions/{id}/reactivate`
- **Action:** reactivate session  
- **Path Param:** id (Long)  
- **Response:** AuctionSessionResponse  

### Update Session
- **PUT** `/auction-sessions/update{id}`
- **Action:** update session by user  
- **Path Param:** id (Long)  
- **Body:** UpdateAuctionSessionRequest + HttpServletRequest  
- **Response:** CreateAuctionSessionResponse  

---

### Admin APIs

#### Search/List Sessions
- **GET** `/auction-sessions/admin/search`
- **Action:** admin search/list  
- **Model Attribute:** AuctionSessionAdminSearchRequest  
- **Query Params:** page, size  
- **Response:** PageResponse<AdminAuctionSessionResponse>  

#### Update Session (Admin)
- **PUT** `/auction-sessions/admin/{id}`
- **Action:** update session as admin  
- **Path Param:** id (Long)  
- **Body:** AdminUpdateSessionRequest  
- **Response:** AdminAuctionSessionResponse  

---

## Authentication

### Authenticate
- **POST** `/auth/authenticate`
- **Body:** AuthenticationRequest  
- **Response:** AuthenticationResponse (200 OK)  
- **Side Effects:**  
  - Sets `refresh_token` cookie (HttpOnly, path=/, maxAge=604800)  
  - `refreshToken` field in response is set to null  

### Introspect Token
- **POST** `/auth/introspect`
- **Body:** IntrospectRequest  
- **Response:** IntrospectResponse (200 OK)  
- **Throws:** ParseException, JOSEException  

### Refresh Token
- **POST** `/auth/refresh-token`
- **Cookie:** refresh_token (optional)  
- **Response:** AuthenticationResponse (200 OK)  
- **Behavior:**  
  - Missing cookie → UnauthorizedException  
  - Otherwise refreshes token  
  - Sets new `refresh_token` cookie  
  - `refreshToken` in response is null  

### Outbound Authenticate
- **POST** `/auth/outbound/authenticate`
- **Query Param:** code (String)  
- **Response:** AuthenticationResponse (200 OK)  
- **Side Effects:**  
  - Sets `refresh_token` cookie  
  - `refreshToken` is null  

### Verify OTP
- **POST** `/auth/verify-otp`
- **Body:** OtpVerificationRequest  
- **Response:** MessageResponse (200 OK)  

### Logout
- **POST** `/auth/logout`
- **Header:** Authorization (Bearer accessToken) - optional  
- **Cookie:** refresh_token - optional  
- **Response:** MessageResponse (200 OK)  
- **Behavior:**  
  - If both token & cookie exist → perform logout  
  - Always clears `refresh_token` cookie (maxAge=0, sameSite=Lax)  
  - May throw ParseException  

# BidController Endpoints
## Endpoints

### 1. Place bid
- Method: `POST`  
- Path: `/auction-sessions/{sessionId}/bids`  
- Path parameters:
  - `sessionId` — `Long`
- Request body:
  - `BidRequest` (validated)
- Response:
  - `BidResponse` (HTTP 200 OK)
- Description: Place a bid in the specified auction session.

### 2. Get bid count by product
- Method: `GET`  
- Path: `/auction-sessions/count/{productId}`  
- Path parameters:
  - `productId` — `Long`
- Response:
  - `Long` (HTTP 200 OK) — total number of bids for the product
- Description: Returns the number of bids associated with the given product.

### 3. Get bid history (paginated)
- Method: `GET`  
- Path: `/auction-sessions/{sessionId}/bids`  
- Path parameters:
  - `sessionId` — `Long`
- Query parameters:
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response:
  - `PageResponse<BidResponse>` (HTTP 200 OK)
- Description: Retrieves paginated bid history for the specified auction session.

# CategoryController Endpoints
## Endpoints

### 1. Create category
- Method: `POST`
- Path: `/categories`
- Request body: `CategoryRequest`
- Response: `CategoryResponse` (HTTP 200 OK)
- Description: Create a new category.

### 2. Update category
- Method: `POST`
- Path: `/categories/{id}`
- Path parameters:
  - `id` — `Long`
- Request body: `CategoryRequest`
- Response: `CategoryResponse` (HTTP 200 OK)
- Description: Update an existing category by id (uses `POST` in controller).

### 3. Delete category
- Method: `DELETE`
- Path: `/categories/{id}`
- Path parameters:
  - `id` — `Long`
- Response: `Void` (HTTP 204 No Content)
- Description: Delete category by id.

### 4. Get all categories (paginated)
- Method: `GET`
- Path: `/categories`
- Query parameters:
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<CategoryResponse>` (HTTP 200 OK)
- Description: Retrieve paginated list of categories.

### 5. Get category by id
- Method: `GET`
- Path: `/categories/{id}`
- Path parameters:
  - `id` — `Long`
- Response: `CategoryResponse` (HTTP 200 OK)
- Description: Retrieve a single category by id.

# FeedBackController Endpoints
## Endpoints

### 1. Create feedback
- Method: `POST`
- Path: `/feedback/invoice/{invoiceId}`
- Path parameters: `invoiceId` — `Long`
- Request body: `FeedbackRequest` (validated)
- Response: `MessageResponse` (HTTP 200 OK)
- Description: Create feedback for a given invoice.

### 2. Update feedback
- Method: `PUT`
- Path: `/feedback/{id}`
- Path parameters: `id` — `Long`
- Request body: `FeedbackRequest` (validated)
- Response: `String` (HTTP 200 OK)
- Description: Update an existing feedback by id.

### 3. Get my total feedback
- Method: `GET`
- Path: `/feedback/my-total-feedback`
- Response: `Long` (HTTP 200 OK)
- Description: Return total number of feedbacks for the current user.

### 4. Get feedback list (public)
- Method: `GET`
- Path: `/feedback/public/{userId}`
- Path parameters: `userId` — `String`
- Query parameters: `page` (default `1`), `size` (default `10`)
- Response: `PageResponse<FeedbackDto>` (HTTP 200 OK)
- Description: Retrieve paginated feedback list for the specified user.

# ImageController Endpoints
## Endpoints
### 1. Upload image
- Method: `POST`
- Path: `/images/upload`
- Request parameters:
  - `file` — `MultipartFile` (form-data, required)
- Responses:
  - `200 OK` — returns saved `Image` on success
  - `400 Bad Request` — when no file provided
  - `500 Internal Server Error` — when upload fails (throws `IOException`)
- Description: Uploads an image and persists it via `imageService.uploadAndSaveImage`.

### 2. Delete image
- Method: `DELETE`
- Path: `/images/{id}`
- Path parameters:
  - `id` — `Integer`
- Responses:
  - `204 No Content` — deleted successfully
  - `404 Not Found` — image not found (throws `RuntimeException`)
  - `500 Internal Server Error` — error communicating with Cloudinary or IO error (`IOException`)
- Description: Deletes image by id via `imageService.deleteImage`.

# InvoiceController Endpoints
## Endpoints

### 1. Get my invoices (paginated)
- Method: `GET`  
- Path: `/invoices/my-invoices`  
- Query params:
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
  - `status` — `InvoiceStatus` (optional)
  - `type` — `InvoiceType` (optional)
- Response: `PageResponse<InvoiceResponse>` (HTTP 200 OK)  
- Description: Retrieve current user's invoices with optional filtering by status and type.

### 2. Get my sales (paginated)
- Method: `GET`  
- Path: `/invoices/my-sales`  
- Query params:
  - `status` — `InvoiceStatus` (optional)
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<InvoiceResponse>` (HTTP 200 OK)

### 3. Get my listing fees (paginated)
- Method: `GET`  
- Path: `/invoices/my-listing-fees`  
- Query params:
  - `status` — `InvoiceStatus` (optional)
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<InvoiceResponse>` (HTTP 200 OK)

### 4. Get sold invoices (by seller) (paginated)
- Method: `GET`  
- Path: `/invoices/sold-invoices`  
- Query params:
  - `status` — `InvoiceStatus` (optional)
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<InvoiceResponse>` (HTTP 200 OK)

### 5. Get invoice by id
- Method: `GET`  
- Path: `/invoices/{id}`  
- Path params:
  - `id` — `Long`
- Response: `InvoiceResponse` (HTTP 200 OK)

### 6. Report non-payment
- Method: `POST`  
- Path: `/invoices/{id}/report-nonpayment`  
- Path params:
  - `id` — `Long`
- Response: `MessageResponse` (HTTP 200 OK)

### 7. Ship invoice
- Method: `POST`  
- Path: `/invoices/{id}/ship`  
- Path params:
  - `id` — `Long`
- Request body: `ShipInvoiceRequest` (`@Validated`)
- Response: `MessageResponse` (HTTP 200 OK)

### 8. Confirm invoice
- Method: `POST`  
- Path: `/invoices/{id}/confirm`  
- Path params:
  - `id` — `Long`
- Response: `MessageResponse` (HTTP 200 OK)

### 9. Get dispute by invoice
- Method: `GET`  
- Path: `/invoices/dispute/{invoiceId}`  
- Path params:
  - `invoiceId` — `Long`
- Response: `DisputeResponse` (HTTP 200 OK)

### 10. Seller dashboard / stats
- Method: `GET`  
- Path: `/invoices/seller-stats`  
- Response: `SellerRevenueResponse` (HTTP 200 OK)

### 11. Report dispute
- Method: `POST`  
- Path: `/invoices/{id}/dispute`  
- Path params:
  - `id` — `Long`
- Request body: `DisputeRequest` (`@Validated`)
- Response: `MessageResponse` (HTTP 200 OK)

### 12. Admin: get invoice by id
- Method: `GET`  
- Path: `/invoices/admin/invoice/{invoiceId}`  
- Path params:
  - `invoiceId` — `Long`
- Response: `InvoiceResponse` (HTTP 200 OK)

### 13. Admin: resolve dispute
- Method: `POST`  
- Path: `/invoices/admin/disputes/{id}/resolve`  
- Path params:
  - `id` — `Long`
- Request body: `ResolveDisputeRequest`
- Response: `MessageResponse` (HTTP 200 OK)

### 14. Admin: list disputes (paginated, search)
- Method: `GET`  
- Path: `/invoices/admin/disputes`  
- Query / model:
  - `@ModelAttribute` `DisputeSearchRequest` (search filters)
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<DisputeResponse>` (HTTP 200 OK)

### 15. Admin: update invoice
- Method: `PUT`  
- Path: `/invoices/admin/update/{id}`  
- Path params:
  - `id` — `Long`
- Request body: `AdminUpdateInvoiceRequest`
- Response: `InvoiceResponse` (HTTP 200 OK)

### 16. Admin: search invoices (paginated)
- Method: `GET`  
- Path: `/invoices/admin/search`  
- Query / model:
  - `@ModelAttribute` `InvoiceAdminSearchRequest`
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<InvoiceResponse>` (HTTP 200 OK)

# NotificationController Endpoints

## Endpoints

### 1. Get my notifications (paginated)
- Method: `GET`
- Path: `/notifications`
- Query parameters:
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<NotificationResponse>` (HTTP 200 OK)
- Description: Retrieve paginated notifications for the current user.

### 2. Mark notification as read
- Method: `PATCH`
- Path: `/notifications/{id}/read`
- Path parameters:
  - `id` — `Long`
- Response: `NotificationResponse` (HTTP 200 OK)
- Description: Mark a single notification as read and return the updated notification.

### 3. Get unread count
- Method: `GET`
- Path: `/notifications/unread-count`
- Response: `Map<String, Long>` (HTTP 200 OK) — e.g., `{ "count": 5 }`
- Description: Return the total number of unread notifications for the current user.

# ProductController Endpoints
## Endpoints

### 1. Create product
- Method: `POST`
- Path: `/products`
- Request body: `ProductRequest`
- Response: `ProductResponse` (HTTP 200 OK)
- Description: Create a new product.

### 2. Get all products (paginated)
- Method: `GET`
- Path: `/products`
- Query parameters:
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<ProductResponse>` (HTTP 200 OK)

### 3. Get my products
- Method: `GET`
- Path: `/products/my-products`
- Response: `List<ProductResponse>` (HTTP 200 OK)
- Description: Retrieve products for the current seller.

### 4. Update product
- Method: `PUT`
- Path: `/products/{id}`
- Path parameters:
  - `id` — `Long`
- Request body: `ProductUpdateRequest`
- Response: `ProductResponse` (HTTP 200 OK)

### 5. Get product by id
- Method: `GET`
- Path: `/products/{id}`
- Path parameters:
  - `id` — `Long`
- Response: `ProductResponse` (HTTP 200 OK)

### 6. Search products (user)
- Method: `GET`
- Path: `/products/search`
- Model / query:
  - `@ModelAttribute` `ProductSearchRequest`
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<ProductResponse>` (HTTP 200 OK)

### 7. Delete (soft) product
- Method: `PATCH`
- Path: `/products/{id}`
- Path parameters:
  - `id` — `Long`
- Response: `Void` (HTTP 204 No Content)
- Description: Soft-delete a product.

### 8. Restore product
- Method: `PATCH`
- Path: `/products/{id}/restore`
- Path parameters:
  - `id` — `Long`
- Response: `Void` (HTTP 204 No Content)
- Description: Re-enable a previously deleted product.

## Admin endpoints

### 9. Get pending products (paginated)
- Method: `GET`
- Path: `/products/admin/pending`
- Query parameters:
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<ProductResponse>` (HTTP 200 OK)

### 10. Verify product (approve/reject)
- Method: `PATCH`
- Path: `/products/admin/{id}/verify`
- Path parameters:
  - `id` — `Long`
- Query parameters:
  - `isApproved` — `Boolean`
- Response: `String` (HTTP 200 OK) — message indicating approved or rejected.

### 11. Search products (admin)
- Method: `GET`
- Path: `/products/admin/search`
- Model / query:
  - `@ModelAttribute` `ProductSearchRequest`
  - `page` — `int` (optional, default `1`)
  - `size` — `int` (optional, default `10`)
- Response: `PageResponse<ProductResponse>` (HTTP 200 OK)

### 12. Admin update product
- Method: `PUT`
- Path: `/products/admin/update/{id}`
- Path parameters:
  - `id` — `Long`
- Request body: `ProductUpdateRequest` (`@Valid`)
- Response: `ProductResponse` (HTTP 200 OK)

# UserController Endpoints
## Endpoints

### Create User
- **Method:** POST  
- **Path:** `/users`  
- **Request Body:** `UserCreationRequest` (@Validated)  
- **Response:** `UserResponse` (HTTP 200 OK)

### Create User (OTP)
- **Method:** POST  
- **Path:** `/users/otp`  
- **Request Body:** `UserCreationRequest` (@Validated)  
- **Response:** `MessageResponse` (HTTP 200 OK)

### Create Password
- **Method:** POST  
- **Path:** `/users/create-password`  
- **Request Body:** `PasswordCreationRequest` (@Validated)  
- **Response:** `Void` (HTTP 200 OK)

### Update My Info
- **Method:** PUT  
- **Path:** `/users/update-my-info`  
- **Request Body:** `UserUpdateRequest`  
- **Response:** `UserResponse` (HTTP 200 OK)

### Get User by ID
- **Method:** GET  
- **Path:** `/users/{id}`  
- **Path Parameter:**  
  - `id` — String  
- **Response:** `UserResponse` (HTTP 200 OK)

### Get My Info
- **Method:** GET  
- **Path:** `/users/my-info`  
- **Response:** `UserResponse` (HTTP 200 OK)

### Get Users (Paginated)
- **Method:** GET  
- **Path:** `/users`  
- **Query Parameters:**  
  - `page` — int (optional, default: 1)  
  - `size` — int (optional, default: 10)  
- **Response:** `PageResponse<UserResponse>` (HTTP 200 OK)

### Delete User
- **Method:** DELETE  
- **Path:** `/users/delete/{id}`  
- **Path Parameter:**  
  - `id` — String  
- **Response:** `String` (HTTP 200 OK) — confirmation message

### Change Password
- **Method:** POST  
- **Path:** `/users/change-password`  
- **Request Body:** `ChangePassRequest`  
- **Response:** `MessageResponse` (HTTP 200 OK)

### Forgot Password
- **Method:** POST  
- **Path:** `/users/forgot-password`  
- **Request Body:** `ForgotPassRequest` (@Validated)  
- **Response:** `MessageResponse` (HTTP 200 OK)

### Reset Password
- **Method:** POST  
- **Path:** `/users/reset-password`  
- **Request Body:** `ResetPassRequest` (@Validated)  
- **Response:** `MessageResponse` (HTTP 200 OK)

### Get My Profile
- **Method:** GET  
- **Path:** `/users/my-profile`  
- **Response:** `UserProfileResponse` (HTTP 200 OK)

### Get Public Profile
- **Method:** GET  
- **Path:** `/users/{userId}/public-profile`  
- **Path Parameter:**  
  - `userId` — String  
- **Response:** `PublicUserProfileResponse` (HTTP 200 OK)

---

## Admin Endpoints

### Search Users (Paginated)
- **Method:** GET  
- **Path:** `/users/admin/search`  
- **Query Parameters:**  
  - `page` — int (default: 1)  
  - `size` — int (default: 10)  
  - `isActive` — Boolean (optional)  
  - `role` — String (optional)  
  - `sort` — String (default: `"newest"`)  
- **Response:** `PageResponse<UserResponse>` (HTTP 200 OK)





