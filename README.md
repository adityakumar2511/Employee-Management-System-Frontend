# EMS Pro — Employee Management System

A comprehensive **MERN Stack (MongoDB, Express, React, Node.js)** application for managing employee data, attendance, payroll, leaves, tasks, and organizational operations with real-time updates and geolocation-based attendance tracking.

---

## 📋 Project Overview

**EMS Pro** is an enterprise-grade Employee Management System designed to streamline HR operations. It provides complete solutions for:

- **Employee Management** — Create, update, and manage employee profiles with documents and avatars
- **Attendance Tracking** — GPS-based geofenced attendance with real-time location verification
- **Leave Management** — Apply, approve, and track leaves with automatic LOP (Loss of Pay) calculations
- **Payroll System** — Dynamic salary structure builder with deductions and allowances
- **Task Management** — Assign and track employee tasks with status updates
- **Personal Holidays** — Manage festival/personal holidays with no salary deduction
- **Reporting** — Generate comprehensive reports on attendance, payroll, and performance
- **Real-time Dashboard** — Live updates with Firebase notifications and counters
- **Role-Based Access** — Separate dashboards for Admin and Employee roles

---

## 🏗️ Full Project Structure

```
Employee Management System/
│
├── Backend/                                    # Node.js Express API Server
│   ├── package.json                           # Backend dependencies
│   ├── server.js                              # Entry point
│   ├── src/
│   │   ├── server.js                          # Main server configuration
│   │   ├── config/
│   │   │   ├── database.js                    # MongoDB/Prisma database config
│   │   │   ├── email.js                       # Email service setup (Nodemailer/SMTP)
│   │   │   └── firebase.js                    # Firebase Admin SDK initialization
│   │   │
│   │   ├── controllers/                       # Business logic handlers
│   │   │   ├── attendance.controller.js       # Attendance CRUD & GPS verification
│   │   │   ├── auth.controller.js             # Login, signup, JWT token generation
│   │   │   ├── employee.controller.js         # Employee CRUD operations
│   │   │   ├── leave.controller.js            # Leave requests & approvals
│   │   │   ├── payroll.controller.js          # Salary calculation & disbursement
│   │   │   ├── personalHoliday.controller.js  # Holiday management
│   │   │   ├── report.controller.js           # Report generation (PDF/Excel)
│   │   │   ├── settings.controller.js         # App settings & configurations
│   │   │   └── task.controller.js             # Task assignment & tracking
│   │   │
│   │   ├── routes/                            # API endpoint definitions
│   │   │   ├── attendance.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── employee.routes.js
│   │   │   ├── leave.routes.js
│   │   │   ├── payroll.routes.js
│   │   │   ├── personalHoliday.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── settings.routes.js
│   │   │   └── task.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                        # JWT verification & user authentication
│   │   │   ├── errorHandler.js                # Global error handling
│   │   │   └── upload.js                      # File upload handling (Multer)
│   │   │
│   │   ├── services/                          # Business logic (reusable functions)
│   │   │   └── [service files]
│   │   │
│   │   ├── utils/
│   │   │   ├── dateHelper.js                  # Date/time utilities
│   │   │   ├── excelHelper.js                 # Excel export functionality
│   │   │   ├── jwt.js                         # JWT token creation/verification
│   │   │   ├── pdfGenerator.js                # PDF report generation
│   │   │   └── response.js                    # Standardized API response format
│   │   │
│   │   ├── database/
│   │   │   └── seed.js                        # Database seeding script
│   │   │
│   │   └── uploads/                           # File storage directories
│   │       ├── avatars/                       # Employee profile pictures
│   │       ├── documents/                     # Employee documents
│   │       ├── logos/                         # Company logos
│   │       └── imports/                       # Bulk import files
│   │
│   ├── config/
│   │   ├── firebase-admin.js
│   │   └── prisma.js
│   │
│   ├── prisma/
│   │   └── schema.prisma                      # Database schema definition
│   │
│   └── README.md
│
└── ems-frontend/                              # Next.js 14 Frontend Application
    ├── package.json                           # Frontend dependencies
    ├── next.config.js                         # Next.js configuration
    ├── tailwind.config.js                     # Tailwind CSS config
    ├── postcss.config.js                      # PostCSS setup
    ├── jsconfig.json                          # JavaScript config
    ├── middleware.js                          # Next.js middleware (auth guards)
    ├── components.json                        # Component library config
    │
    ├── .env                                   # Environment variables (local)
    ├── .env.local.example                     # Environment template
    │
    ├── public/
    │   ├── firebase-messaging-sw.js           # Service worker for notifications
    │   └── manifest.json                      # PWA manifest
    │
    ├── src/
    │   ├── app/                               # Next.js App Router (pages)
    │   │   ├── globals.css                    # Global styles
    │   │   ├── layout.js                      # Root layout
    │   │   ├── page.js                        # Home page
    │   │   ├── providers.js                   # Context providers (React Query, Zustand)
    │   │   │
    │   │   ├── auth/                          # Authentication pages
    │   │   │   ├── page.js
    │   │   │   ├── login/
    │   │   │   ├── change-password/
    │   │   │   └── forgot-password/
    │   │   │
    │   │   ├── admin/                         # Admin-only pages (role-protected)
    │   │   │   ├── dashboard/                 # Admin dashboard with KPIs
    │   │   │   ├── employees/                 # Employee list, add, edit, delete
    │   │   │   ├── attendance/                # Attendance tracking & reports
    │   │   │   ├── leaves/                    # Leave request management
    │   │   │   ├── payroll/                   # Salary processing & reports
    │   │   │   ├── personal-holidays/         # Holiday management
    │   │   │   ├── tasks/                     # Task assignment & monitoring
    │   │   │   ├── reports/                   # Generate & download reports
    │   │   │   ├── settings/                  # App settings & configurations
    │   │   │   └── geo-settings/              # Geofence location setup
    │   │   │
    │   │   └── employee/                      # Employee-only pages (role-protected)
    │   │       ├── dashboard/                 # Employee dashboard
    │   │       ├── attendance/                # Clock in/out with GPS
    │   │       ├── leaves/                    # Apply for leaves
    │   │       ├── personal-holidays/         # View personal holidays
    │   │       ├── tasks/                     # View assigned tasks
    │   │       └── salary/                    # View salary slips
    │   │
    │   ├── components/                        # Reusable React components
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx                # Navigation sidebar
    │   │   │   ├── TopBar.jsx                 # Header with user info
    │   │   │   ├── AdminLayout.jsx            # Admin page wrapper
    │   │   │   ├── EmployeeLayout.jsx         # Employee page wrapper
    │   │   │   └── [other layout components]
    │   │   │
    │   │   ├── ui/                            # Base UI components
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Table.jsx
    │   │   │   ├── Card.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   ├── Select.jsx
    │   │   │   └── [other UI components]
    │   │   │
    │   │   ├── charts/
    │   │   │   ├── AttendanceChart.jsx        # Attendance visualization
    │   │   │   ├── DashboardCharts.js         # KPI charts
    │   │   │   ├── PayrollChart.jsx
    │   │   │   └── [other chart components]
    │   │   │
    │   │   ├── maps/
    │   │   │   └── GeoFenceMap.jsx            # React-leaflet geofence map
    │   │   │
    │   │   ├── salary-builder/
    │   │   │   └── SalaryBuilder.jsx          # Dynamic salary component
    │   │   │
    │   │   ├── notifications/
    │   │   │   └── [notification components]
    │   │   │
    │   │   └── shared/
    │   │       └── [shared components]
    │   │
    │   ├── context/
    │   │   └── AuthContext.js                 # Auth state management (React Context)
    │   │
    │   ├── hooks/                             # Custom React hooks
    │   │   ├── useAuth.js                     # Get current user & auth status
    │   │   ├── useDashboardCounters.js        # Real-time dashboard counters
    │   │   ├── useDebounce.js                 # Debounce hook for search
    │   │   ├── useFirebaseNotifications.js    # Firebase push notifications
    │   │   ├── useFirestore.js                # Firebase real-time subscriptions
    │   │   ├── useGeolocation.js              # Browser GPS tracking
    │   │   └── useToast.js                    # Toast notifications
    │   │
    │   ├── lib/
    │   │   ├── api.js                         # API client base
    │   │   ├── axios.js                       # Axios instance with JWT interceptor
    │   │   ├── firebase.js                    # Firebase configuration & setup
    │   │   ├── queryClient.js                 # React Query client config
    │   │   └── utils.js                       # Common utility functions
    │   │
    │   ├── services/                          # API service layer
    │   │   ├── attendance.service.js          # Attendance API calls
    │   │   ├── auth.service.js                # Auth API calls
    │   │   ├── employee.service.js            # Employee API calls
    │   │   ├── leave.service.js               # Leave API calls
    │   │   ├── payroll.service.js             # Payroll API calls
    │   │   ├── personalHoliday.service.js
    │   │   ├── report.service.js              # Report generation API calls
    │   │   ├── settings.service.js            # Settings API calls
    │   │   └── task.service.js                # Task API calls
    │   │
    │   ├── store/                             # Zustand state management
    │   │   ├── authStore.js                   # Auth state (user, token, role)
    │   │   └── notificationStore.js           # Notifications state
    │   │
    │   ├── styles/                            # Global styles & CSS modules
    │   │   └── [style files]
    │   │
    │   └── utils/                             # Utility functions
    │       ├── calculateSalary.js             # Salary calculation logic
    │       └── formatCurrency.js              # Currency formatting
    │
    └── .next/                                 # Next.js build output (auto-generated)
```

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer/SMTP
- **Firebase**: Admin SDK (realtime updates, notifications)
- **Report Generation**: PDF (pdfkit), Excel (xlsx)
- **Geolocation**: Haversine formula for distance calculation

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: Zustand + React Context
- **API Client**: Axios with JWT refresh interceptor
- **Data Fetching**: React Query
- **Charts**: Recharts
- **Maps**: React-leaflet
- **Notifications**: Firebase Cloud Messaging (FCM)
- **PWA**: Service Workers + Web Push API

---

## ✨ Key Features

### 1. **Geofenced Attendance**
   - Browser GPS tracking with geofence verification
   - Haversine distance calculation for location validation
   - Real-time check-in/check-out with coordinates

### 2. **Firebase Real-time Integration**
   - Live dashboard counters (total employees, today's attendance, pending leaves)
   - Push notifications for leave approvals, task assignments
   - Real-time data synchronization

### 3. **Dynamic Salary Builder**
   - Customizable salary components (Basic, HRA, DA, PF, TDS, etc.)
   - Add/remove components on the fly
   - Automatic deduction calculations

### 4. **Attendance-based LOP Calculation**
   - Automatic Loss of Pay deduction for absent days
   - Configurable LOP percentage
   - Integrated with payroll system

### 5. **Personal Holidays Management**
   - Festival days with no salary cut
   - Configurable holiday calendar
   - Employee holiday tracking

### 6. **Role-Based Access Control**
   - Admin Panel — Full access to all features
   - Employee Portal — Limited access (own data, requests)
   - Middleware protection on both frontend & backend

### 7. **Comprehensive Reporting**
   - Generate PDF/Excel reports for attendance, payroll, leaves
   - Monthly salary slips
   - Employee performance reports
   - Customizable date ranges

### 8. **PWA (Progressive Web App)**
   - Installable on mobile/desktop
   - Offline support with service workers
   - Web push notifications

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB instance
- Firebase project
- SMTP email service credentials

### Backend Setup

```bash
cd Backend
npm install

# Create .env file
echo "
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
" > .env

# Run database seed
npm run seed

# Start server
npm run dev
```

### Frontend Setup

```bash
cd ems-frontend
npm install

# Create .env.local file
echo "
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
" > .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/refresh` — Refresh JWT token
- `POST /api/auth/logout` — Logout user

### Employees
- `GET /api/employees` — Get all employees
- `GET /api/employees/:id` — Get employee details
- `POST /api/employees` — Create employee
- `PUT /api/employees/:id` — Update employee
- `DELETE /api/employees/:id` — Delete employee

### Attendance
- `GET /api/attendance` — Get attendance records
- `POST /api/attendance/check-in` — Check in with GPS
- `POST /api/attendance/check-out` — Check out
- `GET /api/attendance/report` — Attendance report

### Leaves
- `GET /api/leaves` — Get all leave requests
- `POST /api/leaves/apply` — Apply for leave
- `PUT /api/leaves/:id/approve` — Approve leave
- `PUT /api/leaves/:id/reject` — Reject leave

### Payroll
- `GET /api/payroll` — Get payroll records
- `POST /api/payroll/generate` — Generate salary
- `GET /api/payroll/slip/:id` — Get salary slip

### Tasks
- `GET /api/tasks` — Get tasks
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

### Reports
- `GET /api/reports/attendance` — Attendance report
- `GET /api/reports/payroll` — Payroll report
- `GET /api/reports/leaves` — Leave report

---

## 🔐 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

---

## 📦 Dependencies

### Backend Key Packages
- `express` — Web framework
- `mongoose` / `prisma` — Database ODM/ORM
- `jsonwebtoken` — JWT authentication
- `bcryptjs` — Password hashing
- `multer` — File uploads
- `nodemailer` — Email service
- `firebase-admin` — Firebase integration
- `pdfkit` — PDF generation
- `xlsx` — Excel export

### Frontend Key Packages
- `next` — React framework
- `react-query` — Data fetching & caching
- `zustand` — State management
- `axios` — HTTP client
- `firebase` — Firebase SDK
- `recharts` — Charts library
- `react-leaflet` — Maps integration
- `tailwindcss` — Styling
- `react-hot-toast` — Toast notifications

---

## 🚀 Deployment

### Backend (Node.js)
```bash
# Build
npm run build

# Production start
npm start
```

Deploy to: **Heroku**, **Railway**, **Render**, **DigitalOcean**

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

Or simply connect your GitHub repo to Vercel for automatic CI/CD.

---

## 📝 Database Schema (Prisma)

The database includes models for:
- **User** — Auth credentials, roles (Admin/Employee)
- **Employee** — Personal info, department, salary structure
- **Attendance** — Check-in/out records with GPS coordinates
- **Leave** — Leave requests with approval workflow
- **Payroll** — Salary components and deductions
- **Task** — Task assignments with status
- **PersonalHoliday** — Festival/personal holidays
- **Settings** — App configurations

See `Backend/prisma/schema.prisma` for full schema.

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m "Add new feature"`
3. Push to branch: `git push origin feature/new-feature`
4. Open a pull request

---

## 📄 License

This project is proprietary and confidential.

---

## 💡 Support & Documentation

For issues, questions, or feature requests, contact the development team.
