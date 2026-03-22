

# 🌸 PetalRush — Multi-Vendor Flower Marketplace

A full-stack React + Supabase application with 4 role-based panels: Buyer, Seller, Delivery Partner, and Admin.

## Phase 1: Foundation & Authentication

### Database Schema (Supabase)
- **profiles** table: name, email, phone, role (buyer/seller/delivery/admin), status (active/pending/suspended), photo_url, addresses (JSONB), alt_contacts (JSONB), created_at
- **user_roles** table: user_id, role (enum: admin/seller/delivery/buyer) — for secure RLS
- **products** table: seller_id, name, category (roses/lilies/bouquets/seasonal/exotic), price, stock, images (text[]), description, pickup_location (JSONB), rating, created_at
- **orders** table: buyer_id, seller_id, delivery_partner_id, items (JSONB), total_amount, status (pending/confirmed/packed/shipped/delivered/cancelled), payment_mode, address (JSONB), delivery_code (6-digit), pickup_code (7-digit), seller_share, delivery_share, admin_commission, estimated_delivery, created_at
- **payments** table: order_id, seller_share, delivery_share, admin_commission, total_amount, status (pending/completed/held), released_at, released_by
- **reviews** table: user_id, user_name, order_id, rating (1-5), comment, created_at
- **stores** table: seller_id, name, tagline, description, category, banner_url, logo_url, brand_color, whatsapp, email, return_policy

### Authentication
- Email/password sign-up with role selection (Buyer, Seller, Delivery)
- Role-based routing: each role redirects to their panel
- Sellers start with "pending" status until admin approval
- Password reset flow
- Protected routes per role

### Design System
- Brand colors: Pink (#E91E8C), Green (#4CAF50), White — matching PetalRush logo
- Dark mode support
- Responsive sidebar navigation (desktop) + bottom nav (mobile)
- Toast notifications, modals, badges
- PetalRush logo embedded in header/sidebar

## Phase 2: Public Landing Page
- Hero section with "Order Flowers Like Never Before" tagline + PetalRush logo
- How it Works section (Browse → Order → Deliver)
- Features section (Fresh Flowers, Fast Delivery, Multiple Vendors)
- Role CTAs: Shop as Buyer, Sell with Us, Become a Delivery Partner
- Footer with links

## Phase 3: Buyer Panel
- **Shop**: Product grid with category filters (roses, lilies, bouquets, seasonal, exotic), search, ratings display
- **Cart**: Add/remove items, quantity controls, address selection, localStorage persistence
- **Checkout**: Address picker, payment mode selection, order creation with auto-generated 6-digit delivery code, payment split calculation (85% seller, 10% delivery, 5% admin)
- **Orders**: Order list with status filters, 5-step progress bar, delivery code QR display, invoice generation (HTML-based with download)
- **Reviews**: Submit ratings (1-5 stars) + comments for delivered orders
- **Profile**: Personal info, profile photo upload, manage addresses (max 3), alternate contacts, change password

## Phase 4: Seller Panel
- **Dashboard**: Stats tiles (total products, orders, earnings), recent orders, pending orders
- **Products**: Product table with CRUD, image upload to Supabase Storage, category/price/stock management, pickup location with GPS
- **Orders**: Order cards with status management (confirm → pack → generate 7-digit pickup code), QR code display for delivery pickup
- **Earnings**: Revenue breakdown, payment history, pending/released amounts
- **Profile & Store**: Personal info, store settings (name, tagline, banner, logo, brand color), bank details with UPI QR, document uploads

## Phase 5: Delivery Partner Panel
- **Dashboard**: Stats (active deliveries, completed, earnings)
- **Available Pickups**: List of packed orders ready for pickup, accept via pickup code or QR scan
- **Active Deliveries**: Current deliveries with buyer info, address, Google Maps navigation link, delivery code entry (6-digit OTP input)
- **QR Scanner**: Camera-based QR scanning for both pickup codes and delivery codes
- **History**: Past deliveries with details
- **Earnings**: 10% commission tracking, payment history
- **Profile**: Personal info, vehicle details, documents (Aadhaar, PAN), bank details

## Phase 6: Admin Panel
- **Dashboard**: Platform metrics (total users, orders, GMV, commission earned), recent activity feed, pending seller approvals, pending payouts
- **Analytics**: Order trends, revenue charts, user growth
- **User Management**: View/search all users by role, approve/suspend sellers, view user details
- **All Orders**: Full order list with search/filter, order detail modal with payment split breakdown, hold payment capability
- **Products**: View all products across sellers, remove products
- **Payments & Payouts**: GMV tracking, pending/released/held payments, seller/delivery payout cards with UPI QR, bulk release functionality
- **Billing & Reports**: Payment release management, hold/release individual payments
- **Admin Profile**: Personal info, bank details, UPI setup

## Key Features Across All Panels
- Role-based access control with Supabase RLS policies
- Real-time order status updates
- QR code generation (for pickup/delivery codes)
- Responsive design (sidebar on desktop, bottom nav on mobile)
- Dark mode toggle
- Indian Rupee formatting (₹)
- Profile photo upload via Supabase Storage

