# Shadhinota Hall Management System
## Pabna University of Science and Technology (PUST), Bangladesh

An institutional full-stack residential hall management application developed for Pabna University of Science and Technology. Modernizes student residency applications, bed allocations, complaint tracking, verified fee collection via SSLCommerz sandbox payment gateway, and administrative oversight.

---

## 🏛️ System Features & Modules

### 1. University Landing Page
- Institutional navigation with official Pabna University of Science and Technology identity.
- Campus/hall photography and facility previews (Reading Hall, Dining, Maintenance, High-Speed Wi-Fi).
- Live official notice board pulling circulars directly from the database.
- 4-step interactive seat allocation workflow guide.

### 2. Student Management & Portal
- **Registration with Email OTP**: Multi-step verification using Nodemailer.
- **Role-based Authentication**: Secure JWT tokens with protected student, staff, and admin routes.
- **Seat Application**: Submit academic credentials (CGPA, department, session, guardian details, documents).
- **Seat Clearance Order**: View and download printable official University Seat Allocation Certificate.
- **Maintenance Tickets**: Direct issue reporting (Electrical, Plumbing, Carpentry, Internet) with priority tags.

### 3. Room & Bed Management (Phase 4)
- Configurable hall records: Blocks (A, B, C, Main Building), Floors (1-10), Rooms, and Beds (A, B, C, D).
- Room capacities, types (standard, attached bath, accessible), and real-time occupancy indicators.
- Safe vacancy and seat allocation management preventing overcapacity and duplicate allocations.

### 4. Official SSLCommerz Sandbox Payment Gateway (Phase 5)
- Automated invoice generation upon administrative seat approval (admission/allocation fee).
- Server-side transaction initialization with merchant store credentials.
- Multi-channel sandbox simulation (bKash, Nagad, Cards).
- Server-to-server authoritative transaction validation with duplicate callback prevention.
- Printable, official digital money receipts with transaction IDs.

### 5. Administrative Control Center (Phase 6 & 7)
- Real-time dashboard KPI metrics (Occupancy rate, total students, verified revenues, pending dues).
- Seat allocation approval engine with room and bed assignment.
- Student & Staff account approval queue.
- Fee and invoice management system.
- Notice management (Publish, categorize by priority, expire, or remove).
- Comprehensive activity audit trail (`AuditLog`) tracking financial and seat allocation changes.

---

## 🚀 Ubuntu Setup & Execution Guide

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (v9+)
- MongoDB Atlas or Local MongoDB instance

### 1. Backend Configuration & Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template if not configured
cp .env.example .env

# Start backend server
npm run dev
# Or with node directly:
node --experimental-global-webcrypto index.js
```
The backend API starts on `http://localhost:5000`.

### 2. Frontend Configuration & Startup
```bash
# Open another terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend UI starts on `http://localhost:5173`.

---

## ⚙️ Environment Variables

Located in `backend/.env`:

| Key | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP Port | `5000` |
| `MONGO_URI` | MongoDB Connection URI | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `SMTP_USER` | Gmail/SMTP username for OTP emails | `example@gmail.com` |
| `SMTP_PASS` | SMTP App password | `xxxx-xxxx-xxxx-xxxx` |
| `APP_NAME` | Display name in emails & notices | `Shadhinota Hall PUST` |
| `BACKEND_URL` | Backend public URL for callbacks | `http://localhost:5000` |
| `FRONTEND_URL` | Frontend client application URL | `http://localhost:5173` |
| `SSLCOMMERZ_STORE_ID` | SSLCommerz Merchant Store ID | `pust661234test` |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz Merchant Store Password | `pust661234test@ssl` |
| `SSLCOMMERZ_IS_LIVE` | Set to `false` for Sandbox mode | `false` |

---

## 🧪 Default Test Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Ashikuzzaman | `ashik.cse.pust@gmail.com` | `password123` |
| **Staff** | Sohel Rana | `sohel.cse.pust@gmail.com` | `password123` |
| **Student** | Khalid Hossen | `khalid.cse.pust@gmail.com` | `password123` |
| **Student** | Swapnomoy Biswas | `khalidhossen785@gmail.com` | `password123` |

---

## 🔒 Security Architecture
- Public registration restricts unauthorized role assignment (students cannot register as admin).
- Transaction validations occur strictly server-side through SSLCommerz validation APIs.
- Passwords hashed using `bcryptjs` (salt factor 10).
- OTP verification enforced with a 10-minute TTL index on MongoDB.
