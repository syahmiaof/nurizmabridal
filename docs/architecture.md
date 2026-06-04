# CMS NurizmaBridal (Hanim Henna) Architecture

## Directory Structure
```
cms-nurizmabridal/
 ├── docs/architecture.md
 ├── index.html
 ├── login.html
 ├── admin.html
 ├── css/main.css
 ├── js/config.js (For Supabase initialization)
 ├── js/auth.js (For session guarding and login logic)
 ├── js/public.js 
 ├── js/admin.js 
 └── assets/icons/H.jpg (Placeholder for the official visual identity logo)
```

## Database Schema (Supabase PostgreSQL)

### 1. `users` Table
- `id` (uuid)
- `role` (text) - either 'admin' or 'developer'
- `created_at` (timestamp with time zone)

### 2. `packages` Table
- `id` (serial)
- `name` (text)
- `price` (numeric)
- `description` (text)
- `is_active` (boolean)

### 3. `bookings` Table
- `id` (serial)
- `customer_name` (text)
- `date` (date)
- `start_time` (time)
- `end_time` (time)
- `details_lokasi_map` (text)
- `package_id` (integer) - referencing packages.id
- `created_at` (timestamp with time zone)

### 4. `bayaran` Table
- `id` (serial)
- `booking_id` (integer) - referencing bookings.id
- `amount_paid` (numeric)
- `balance` (numeric)
- `status` (text) - 'Pending Deposit', 'Deposit Dibayar', 'Selesai'
- `updated_at` (timestamp with time zone)
