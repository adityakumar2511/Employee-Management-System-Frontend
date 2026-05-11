# EMS Pro — Frontend
link:- https://employee-management-system-2511.vercel.app/

Next.js 16 frontend for the Employee Management System with real-time Socket.io updates, Firebase push notifications, and geofenced attendance.

---

## 🚀 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | React framework |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| React Query (@tanstack/react-query) | Server state + caching |
| Axios | HTTP client + JWT interceptor |
| Socket.io-client | Real-time updates |
| Firebase SDK | Push notifications (FCM) |
| Recharts | Charts & graphs |
| React-Leaflet + Leaflet | Geofence map |
| jose | JWT verification (middleware) |
| Zod | Runtime input validation |
| Sonner | Toast notifications |
| Radix UI | Accessible UI primitives |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Update the existing .env file with backend API URL and Firebase config
# If you do not have .env, create one at the project root.

# 3. Start development server
npm run dev
```

App: **http://localhost:3000**

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
├── .env                              # Environment variables
└── src/
    ├── app/                           # Next.js App Router pages
    │   ├── layout.js                  # Root layout
    │   ├── providers.js               # React Query + socket provider
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
    │   │   ├── Avatar.jsx
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── Dropdown.jsx
    │   │   ├── Input.jsx
    │   │   ├── Label.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Pagination.jsx
    │   │   ├── Select.jsx
    │   │   ├── Spinner.jsx
    │   │   └── Table.jsx
    │   ├── charts/
    │   │   ├── AttendanceChart.jsx
    │   │   ├── DashboardCharts.js
    │   │   ├── DepartmentChart.jsx
    │   │   ├── PayrollChart.jsx
    │   │   └── TaskChart.jsx
    │   ├── maps/
    │   │   ├── GeoFenceMap.jsx
    │   │   └── LocationPicker.jsx
    │   ├── notifications/
    │   │   └── NotificationBell.js
    │   └── salary-builder/
    │       ├── SalaryBuilder.js
    │       └── SalaryStructureBuilder.jsx
    ├── context/
    │   └── AuthContext.js
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useDashboardCounters.js
    │   ├── useDebounce.js
    │   ├── useFirebaseNotifications.js
    │   ├── useFirestore.js
    │   ├── useGeolocation.js
    │   ├── useSocket.js
    │   ├── useToast.js
    │   └── useWakeUpBackend.js
    ├── lib/
    │   ├── api.js
    │   ├── axios.js
    │   ├── backendWaker.js
    │   ├── firebase.js
    │   ├── queryClient.js
    │   ├── socket.js
    │   └── utils.js
    ├── public/
    │   ├── firebase-messaging-sw.js
    │   └── manifest.json
    ├── services/
    │   ├── attendance.service.js
    │   ├── auth.service.js
    │   ├── employee.service.js
    │   ├── leave.service.js
    │   ├── payroll.service.js
    │   ├── personalHoliday.service.js
    │   ├── report.service.js
    │   ├── settings.service.js
    │   └── task.service.js
    ├── store/
    │   ├── authStore.js
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
React Query cache is invalidated
          ↓
Components refresh automatically ✅
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/socket.js` | Socket.io client instance (singleton) |
| `src/hooks/useSocket.js` | Listen for events and invalidate cache |
| `src/app/providers.js` | Connect socket and initialize React Query |
| `src/lib/queryClient.js` | Query client with `staleTime: 0` |

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
  401 response → refresh token request
  refresh fail → logout + redirect to /auth/login

Next.js Middleware (middleware.js):
  /admin/* → ADMIN role check
  /employee/* → EMPLOYEE role check
  /auth/* → Redirect logged-in users to dashboard
```

### Auth Files

| File | Purpose |
|------|---------|
| `src/store/authStore.js` | Persist auth state, user, and tokens |
| `src/lib/axios.js` | Attach JWT and auto-refresh tokens |
| `middleware.js` | Server-side route protection |

---

## 📍 Geofenced Attendance

```
Browser GPS → Haversine distance calculation
           → Compare with office geofence location
           → Within radius? → Check-in allowed ✅
           → Outside radius? → Error with distance shown ❌
```

---

## 🔔 Firebase Push Notifications

Employee receives:
- Leave approve/reject
- Task assigned
- Salary credited

Admin receives:
- New leave request
- New personal holiday request

---

## 🔐 Environment Variables

Update the root `.env` file with your backend and Firebase settings.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_for_push

JWT_SECRET=your_same_jwt_secret_as_backend
```

---

## 📦 Scripts

```bash
npm run dev    # Start development server on localhost:3000
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

---

## 📄 Notes

- Make sure the backend API is running and reachable from `NEXT_PUBLIC_API_URL`.
- If you change Firebase settings, restart the dev server.
- This frontend uses server-side route protection in `middleware.js` and client-side auth state in Zustand.
