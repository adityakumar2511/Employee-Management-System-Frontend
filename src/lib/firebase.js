import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, collection, doc, onSnapshot, query, where, orderBy, limit, updateDoc } from "firebase/firestore"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (singleton)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

let messaging = null

// Initialize FCM only in browser
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app)
    }
  })
}

// Subscribe to employee notifications (realtime)
export function subscribeToNotifications(employeeId, callback) {
  if (!employeeId) return () => {}

  const q = query(
    collection(db, "notifications"),
    where("employeeId", "==", employeeId),
    orderBy("createdAt", "desc"),
    limit(50)
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = []
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() })
    })
    callback(notifications)
  })
}

// Subscribe to dashboard counters (admin realtime)
export function subscribeToDashboardCounters(callback) {
  const docRef = doc(db, "dashboard_counters", "today")
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data())
    } else {
      callback({ present: 0, absent: 0, halfDay: 0, wfh: 0, onLeave: 0 })
    }
  })
}

// Subscribe to announcements
export function subscribeToAnnouncements(departmentId, callback) {
  const q = query(
    collection(db, "announcements"),
    orderBy("createdAt", "desc"),
    limit(20)
  )

  return onSnapshot(q, (snapshot) => {
    const announcements = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      // Show if targetDepartment is null (all) or matches employee's department
      if (!data.targetDepartmentId || data.targetDepartmentId === departmentId) {
        announcements.push({ id: doc.id, ...data })
      }
    })
    callback(announcements)
  })
}

// Subscribe to activity logs (admin)
export function subscribeToActivityLogs(callback) {
  const q = query(
    collection(db, "activity_logs"),
    orderBy("timestamp", "desc"),
    limit(30)
  )

  return onSnapshot(q, (snapshot) => {
    const logs = []
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() })
    })
    callback(logs)
  })
}

// Mark notification as read
export async function markNotificationRead(notificationId) {
  const ref = doc(db, "notifications", notificationId)
  await updateDoc(ref, { read: true })
}

// Mark all notifications as read
export async function markAllNotificationsRead(employeeId) {
  // This would typically be done via a backend call or batch update
  // For now, handled via API endpoint
}

// Request FCM push permission
export async function requestFCMPermission() {
  if (!messaging) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })
      return token
    }
    return null
  } catch (error) {
    console.error("FCM permission error:", error)
    return null
  }
}

// Listen to foreground FCM messages
export function onFCMMessage(callback) {
  if (!messaging) return () => {}
  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}

export { db, messaging, app }
