# Heart Leaf Blooms - Complete API Integration Guide

**Base URL**: `http://localhost:7071`
**Authentication**: **HTTP-Only Cookies**.
**Mandatory Header for ALL requests**:
```javascript
{
    credentials: 'include'
}
```

---

## 1. Authentication Modules

### A. User Auth
*   **Cookie Name**: `user_token`
*   **Register**: `POST /user/register`
    *   **Payload**:
        ```json
        {
          "username": "String",
          "user_email": "String",
          "user_password": "String",
          "user_address": [{"address": "Str", "city": "Str", "state": "Str", "pincode": "Str"}]
        }
        ```
*   **Login**: `POST /user/login`
    *   **Payload**: `{"user_email": "...", "user_password": "..."}`
*   **Logout**: `POST /user/logout` (No body)

### B. Vendor Auth
*   **Cookie Name**: `vendor_token`
*   **Register**: `POST /vendor/register`
    *   **Payload**:
        ```json
        {
          "name": "String",
          "email": "String",
          "password": "String",
          "shopName": "String",
          "shopAddress": "String",
          "shopDescription": "String",
          "bankName": "String",
          "IFSC": "String",
          "accountNumber": "String"
        }
        ```
*   **Login**: `POST /vendor/login`
    *   **Payload**: `{"vendorId": "String", "password": "String"}`
*   **Logout**: `POST /vendor/logout`

### C. Admin Auth
*   **Cookie Name**: `token`
*   **Register**: `POST /admin/create`
    *   **Payload**: `{"name": "...", "email": "...", "password": "..."}`
*   **Login**: `POST /admin/login`
    *   **Payload**: `{"email": "...", "password": "..."}`
*   **Logout**: `POST /admin/logout`

---

## 2. Core Functional Modules

### A. Products (Vendor Managed)
*   **Create Product**: `POST /product`
    *   **Payload**:
        ```json
        {
          "vendor_id": "String",
          "category_id": 1, // Integer
          "product_name": "String",
          "product_title": "String",
          "product_description": "String",
          "product_price": 500.00,
          "discount_price": 450.00, // Optional
          "product_guide": "String",
          "product_images": ["L_ul1", "M_url1", "S_url1", "L_url2", "M_url2", "S_url2"] 
        }
        ```
*   **Update Product**: `PUT /product/:id`
    *   **Payload**: (Same keys as create, send only changed fields)
*   **Upload Image**: `POST /product/upload-image`
    *   **Body**: FormData(`image` = file)
*   **Get All**: `GET /product`
*   **Get One**: `GET /product/:id`

### B. Shopping Cart
*   **Add Item**: `POST /cart/:userId`
    *   **Payload**: `{"product_id": "String", "quantity": 1}`
*   **Update Qty**: `PUT /cart/:userId/:cartId`
    *   **Payload**: `{"quantity": 5}`
*   **Delete Item**: `DELETE /cart/:userId/:cartId`

### C. Wishlist
*   **Add Item**: `POST /wishlist/:userId`
    *   **Payload**: `{"product_id": "String"}`
*   **Delete Item**: `DELETE /wishlist/:userId/:wishlistId`

### D. Orders & Payments
1.  **Init Payment**: `POST /payment/create-order`
    *   **Payload**: `{"user_id": "String"}`
    *   **Returns**: Razorpay Order ID.
2.  **Completer Payment**: `POST /payment/verify`
    *   **Payload**:
        ```json
        {
          "razorpay_order_id": "String",
          "razorpay_payment_id": "String",
          "razorpay_signature": "String",
          "user_id": "String"
        }
        ```
3.  **Create Manual Order (No Pay)**: `POST /order`
    *   **Payload**: `{"user_id": "String"}`

### E. Admin Management
*   **Get All Users**: `GET /user/admin/all`
*   **Get All Orders**: `GET /order/admin`
*   **Update Order Status**: `PUT /order/admin/:orderId`
    *   **Payload**: `{"status": "shipped"}`
*   **Approve Vendor**: `PUT /vendor/approve/:id`
    *   **Payload**: `{"status": "approved", "commission_rate": 0.15}`
*   **Get Payout Stats**: `GET /admin/payout-stats`
*   **Process Payout**: `POST /payment/vendor-payout`
    *   **Payload**: `{"vendor_id": "...", "amount": 500, "payment_method": "upi"}`
