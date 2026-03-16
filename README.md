# EMS Pro — Frontend

Next.js 14 frontend for the Employee Management System with real-time Socket.io updates, Firebase push notifications, and geofenced attendance.

---

## 🚀 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 (App Router) | React framework |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| React Query (@tanstack/react-query) | Server state + caching |
| Axios | HTTP client (JWT interceptor) |
| Socket.io-client | Real-time updates |
| Firebase SDK | Push notifications (FCM) |
| Recharts | Charts & graphs |
| React-Leaflet | Geofence map |
| react-hot-toast | Toast notifications |
| jose | JWT verification (middleware) |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# .env.local fill karo (API URL, Firebase config)

# 3. Development server start
npm run dev
```

Frontend: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@emspro.com | Admin@123 |
| Employee | rahul@emspro.com | Employee@123 |

---

## 📁 Project Structure

```
ems-frontend/
├── middleware.js                      # Route protection (JWT cookie check)
├── next.config.js
├── tailwind.config.js
├── .env.local                         # Environment variables
└── src/
    ├── app/                           # Next.js App Router pages
    │   ├── layout.js                  # Root layout
    │   ├── providers.js               # React Query + Socket provider
    │   ├── auth/
    │   │   ├── login/
    │   │   ├── forgot-password/
    │   │   └── change-password/
    │   ├── admin/                     # Admin-only pages
    │   │   ├── dashboard/
    │   │   ├── employees/
    │   │   ├── attendance/
    │   │   ├── leaves/
    │   │   ├── payroll/
    │   │   ├── personal-holidays/
    │   │   ├── tasks/
    │   │   ├── reports/
    │   │   ├── settings/
    │   │   └── geo-settings/
    │   └── employee/                  # Employee-only pages
    │       ├── dashboard/
    │       ├── attendance/
    │       ├── leaves/
    │       ├── personal-holidays/
    │       ├── tasks/
    │       └── salary/
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx
    │   │   ├── TopBar.jsx
    │   │   ├── AdminLayout.jsx
    │   │   └── EmployeeLayout.jsx
    │   ├── ui/                        # Base UI components
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Table.jsx
    │   │   ├── Card.jsx
    │   │   ├── Badge.jsx
    │   │   └── Select.jsx
    │   ├── charts/
    │   │   ├── AttendanceChart.jsx
    │   │   ├── DashboardCharts.js
    │   │   └── PayrollChart.jsx
    │   ├── maps/
    │   │   └── GeoFenceMap.jsx        # React-leaflet geofence
    │   └── salary-builder/
    │       └── SalaryBuilder.jsx
    ├── hooks/
    │   ├── useSocket.js               # ⚡ Real-time Socket.io hook
    │   ├── useAuth.js
    │   ├── useGeolocation.js          # Browser GPS
    │   ├── useFirebaseNotifications.js
    │   ├── useDebounce.js
    │   └── useToast.js
    ├── lib/
    │   ├── axios.js                   # Axios + JWT refresh interceptor
    │   ├── socket.js                  # ⚡ Socket.io client instance
    │   ├── queryClient.js             # React Query config (staleTime: 0)
    │   ├── firebase.js                # Firebase config
    │   └── utils.js
    ├── services/                      # API call functions
    │   ├── auth.service.js
    │   ├── employee.service.js
    │   ├── attendance.service.js
    │   ├── leave.service.js
    │   ├── payroll.service.js
    │   ├── personalHoliday.service.js
    │   ├── task.service.js
    │   ├── report.service.js
    │   └── settings.service.js
    ├── store/
    │   ├── authStore.js               # Zustand auth state (persist)
    │   └── notificationStore.js
    └── utils/
        ├── calculateSalary.js
        └── formatCurrency.js
```

---

## ⚡ Real-time Updates (Socket.io)

### How it works

```
Backend emits "data:refresh" event
          ↓
useSocket() hook receives it
          ↓
React Query cache invalidate hota hai
          ↓
Component automatically re-renders ✅
```

### Key Files

| File | Kya karta hai |
|------|--------------|
| `src/lib/socket.js` | Socket.io client instance (singleton) |
| `src/hooks/useSocket.js` | Events listen + React Query invalidate |
| `src/app/providers.js` | App start pe socket connect karta hai |
| `src/lib/queryClient.js` | `staleTime: 0` — always fresh data |

### Socket Events Listened

| Event | React Query Keys Invalidated |
|-------|------------------------------|
| `data:refresh` → `employees` | `['employees']`, `['dashboard-stats']` |
| `data:refresh` → `attendance` | `['attendance']`, `['attendance','today']`, `['dashboard-stats']` |
| `data:refresh` → `leaves` | `['leaves']`, `['leaves','my']`, `['leaves','balance']` |
| `data:refresh` → `tasks` | `['tasks']`, `['tasks','my']`, `['dashboard-stats']` |
| `data:refresh` → `payroll` | `['payroll']`, `['payroll','my-slips']` |
| `data:refresh` → `dashboard` | `['dashboard-stats']` |
| `attendance:updated` | `['attendance','today']`, `['attendance','my']` |

---

## 🔐 Authentication Flow

```
Login → JWT access token (15min) + refresh token (7d)
     → localStorage + cookies (httpOnly for middleware)

Axios interceptor:
  401 response → refresh token se naya access token lo
  Refresh fail → logout + /auth/login redirect

Next.js Middleware (middleware.js):
  /admin/* → ADMIN role check
  /employee/* → EMPLOYEE role check
  /auth/* → Already logged in? → dashboard redirect
```

### Auth Files

| File | Purpose |
|------|---------|
| `src/store/authStore.js` | Zustand persist store (user, tokens) |
| `src/lib/axios.js` | JWT attach + auto-refresh interceptor |
| `middleware.js` | Server-side route protection (jose JWT verify) |

---

## 📍 Geofenced Attendance

```
Browser GPS → Haversine distance calculation
           → Backend office location se compare
           → Within radius? → Check-in allowed ✅
           → Outside radius? → Error with distance shown ❌
```

---

## 🔔 Firebase Push Notifications

Employee ko ye notifications milti hain:
- Leave approve/reject
- Task assigned
- Salary credited

Admin ko:
- New leave request
- New personal holiday request

---

## 🔐 Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_for_push

# JWT Secret (same as backend — middleware ke liye)
JWT_SECRET=your_same_jwt_secret_as_backend
```

---

## 📦 Install Commands

```bash
# Dependencies install
npm install

# Real-time ke liye (agar nahi hai)
npm install socket.io-client
```

---

## 🌐 Pages Overview

### Admin Pages

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | KPI cards, attendance chart, recent leaves |
| `/admin/employees` | Employee list, add/edit/delete, bulk import |
| `/admin/attendance` | Daily attendance, WFH requests, override |
| `/admin/leaves` | Leave requests, approve/reject |
| `/admin/payroll` | Salary structure, generate payroll, slips |
| `/admin/personal-holidays` | Festival holiday requests |
| `/admin/tasks` | Task assignment, progress tracking |
| `/admin/reports` | Excel/PDF reports download |
| `/admin/settings` | Company settings, leave types |
| `/admin/geo-settings` | Office geofence locations |

### Employee Pages

| Route | Description |
|-------|-------------|
| `/employee/dashboard` | Leave balance, tasks, salary summary |
| `/employee/attendance` | GPS check-in/out, monthly calendar |
| `/employee/leaves` | Apply leave, history, balance |
| `/employee/personal-holidays` | Festival holiday apply |
| `/employee/tasks` | Assigned tasks, progress update |
| `/employee/salary` | Salary slips download |

---

## 🚀 Build & Deploy

```bash
# Production build
npm run build

# Production start
npm start
```

### Vercel Deploy (Recommended)

```bash
# Vercel CLI se
npm install -g vercel
vercel deploy

# Ya GitHub repo connect karo — auto CI/CD
```

**Environment variables** Vercel dashboard mein add karo (Project → Settings → Environment Variables).

---

## 📄 License

This project is proprietary and confidential.