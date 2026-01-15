# Heart Leaf Blooms API Documentation

**Base URL**: `http://localhost:7071`
**Compression**: This API supports GZIP compression. The server automatically compresses responses if the client sends `Accept-Encoding: gzip` in the headers (standard in all browsers/axios).

---

## Authentication Mechanism
Authentication is handled via **HTTP-Only Cookies**.
1.  **Frontend**: You MUST set `credentials: "include"` in your fetch/axios config.
2.  **Cookies Used**:
    *   `user_token`: For User Auth
    *   `vendor_token`: For Vendor Auth
    *   `token`: For Admin Auth

---

## 1. User Endpoints

### Register User
*   **Method**: `POST`
*   **Endpoint**: `/user/register`
*   **Payload (Request Body)**:
    ```json
    {
      "username": "John Doe",
      "user_email": "john@example.com",
      "user_password": "securepassword123",
      "user_address": [
          {
             "address": "123 Main St", 
             "city": "Mumbai", 
             "state": "Maharashtra", 
             "pincode": "400001" 
          }
      ]
    }
    ```
*   **Response**: `201 Created` - User object.

### Login User
*   **Method**: `POST`
*   **Endpoint**: `/user/login`
*   **Payload**:
    ```json
    {
      "user_email": "john@example.com",
      "user_password": "securepassword123"
    }
    ```
*   **Response**: `200 OK` (Sets `user_token` cookie)

### Google SSO Login
*   **Method**: `POST`
*   **Endpoint**: `/user/google-login`
*   **Payload**:
    ```json
    {
      "token": "GOOGLE_ID_TOKEN_FROM_FRONTEND"
    }
    ```
*   **Response**: `200 OK` (Sets `user_token` cookie), returns `{ message, token, user }`

### Get Google Client ID
*   **Method**: `GET`
*   **Endpoint**: `/user/google-client-id`
*   **Payload**: None
*   **Response**: 
    ```json
    {
      "clientId": "YOUR_GOOGLE_CLIENT_ID"
    }
    ```

### Get User Profile
*   **Method**: `GET`
*   **Endpoint**: `/user/:id` (Replace `:id` with User ID)
*   **Payload**: None
*   **Response**: User object with addresses, cart, and wishlist.

### Add Address
*   **Method**: `POST`
*   **Endpoint**: `/user/:id/address`
*   **Payload**:
    ```json
    {
      "address": "Flat 101, Galaxy Apts",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411057"
    }
    ```

---

## 2. Vendor Endpoints

### Register Vendor
*   **Method**: `POST`
*   **Endpoint**: `/vendor/register`
*   **Payload**:
    ```json
    {
      "name": "Vendor Name",
      "email": "vendor@shop.com",
      "password": "somesecurepassword",
      "shopName": "Best Flowers",
      "shopAddress": "flower market st",
      "shopDescription": "We sell fresh roses",
      "bankName": "HDFC",
      "accountNumber": "1234567890",
      "IFSC": "HDFC0001234"
    }
    ```

### Login Vendor
*   **Method**: `POST`
*   **Endpoint**: `/vendor/login`
*   **Payload**:
    ```json
    {
      "vendorId": "uuid-from-registration",
      "password": "somesecurepassword"
    }
    ```
*   **Response**: `200 OK` (Sets `vendor_token` cookie)

### Get All Vendors (Public)
*   **Method**: `GET`
*   **Endpoint**: `/vendor`
*   **Response**: Array of all vendor objects.

### Get Single Vendor (Public)
*   **Method**: `GET`
*   **Endpoint**: `/vendor/:id`
*   **Response**: Single vendor object.

---

## 3. Product Endpoints

### Upload Image
*   **Method**: `POST`
*   **Endpoint**: `/product/upload-image`
*   **Payload**: `FormData`
    *   Key: `image`
    *   Value: `(File Object)`
*   **Response**:
    ```json
    {
      "message": "Image uploaded successfully",
      "data": {
        "large": "http://.../large_filename.jpg",
        "medium": "http://.../medium_filename.jpg",
        "small": "http://.../small_filename.jpg"
      }
    }
    ```

### Create Product
*   **Method**: `POST`
*   **Endpoint**: `/product`
*   **Payload**:
    ```json
    {
      "vendor_id": "vendor-uuid",
      "category_id": 1,
      "product_name": "Red Rose Bouquet",
      "product_title": "Fresh Red Roses",
      "product_description": "A beautiful bouquet...",
      "product_price": 599,
      "discount_price": 499,
      "product_guide": "Keep in water...",
      "product_images": [
         "url_large_1", "url_medium_1", "url_small_1",
         "url_large_2", "url_medium_2", "url_small_2"
      ]
    }
    ```

### Get All Products
*   **Method**: `GET`
*   **Endpoint**: `/product`
*   **Response**: Array of product objects.

### Get Single Product
*   **Method**: `GET`
### Get Single Product
*   **Method**: `GET`
*   **Endpoint**: `/product/:id`

### Update Product
*   **Method**: `PUT`
*   **Endpoint**: `/product/:id`
*   **Payload**:
    ```json
    {
      "product_name": "Updated Name",
      "product_price": 600,
      "product_images": ["new_url_L", "new_url_M", "new_url_S"]
    }
    ```
    *(Note: Only provide fields you want to update)*

---

## 4. Cart & Wishlist

### Add to Cart
*   **Method**: `POST`
*   **Endpoint**: `/cart/:userId`
*   **Payload**:
    ```json
    {
      "product_id": "product-uuid",
      "quantity": 1
    }
    ```

### Update Cart Quantity
*   **Method**: `PUT`
*   **Endpoint**: `/cart/:userId/:cartId`
*   **Payload**:
    ```json
    {
      "quantity": 3
    }
    ```

### Add to Wishlist
*   **Method**: `POST`
*   **Endpoint**: `/wishlist/:userId`
*   **Payload**:
    ```json
    {
      "product_id": "product-uuid"
    }
    ```

---

## 5. Payment & Orders (Razorpay)

### Step 1: Initialize Payment (Create Order)
*   **Method**: `POST`
*   **Endpoint**: `/payment/create-order`
*   **Payload**:
    ```json
    {
      "user_id": "user-uuid"
    }
    ```
    *(Note: Amount is calculated automatically on server from User's Cart)*
*   **Response**: Razorpay Order Object (contains `id`, `amount`, `currency`).

### Step 2: Verify & Place Order
*   **Method**: `POST`
*   **Endpoint**: `/payment/verify`
*   **Payload**:
    ```json
    {
      "razorpay_order_id": "order_Obs...",
      "razorpay_payment_id": "pay_Obs...",
      "razorpay_signature": "signature_hash...",
      "user_id": "user-uuid"
    }
    ```
*   **Response**: `200 OK` - Order placed successfully.
