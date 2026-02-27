'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { useAuth } from './useAuth'

export function useFirebaseNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const q = query(
      collection(db, 'notifications'),
      where('employeeId', '==', String(user.id)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setNotifications(notifs)
        setUnreadCount(notifs.filter((n) => !n.isRead).length)
        setLoading(false)
      },
      (err) => {
        console.error('Notifications listener error:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.id])

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
      })
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db)
      notifications
        .filter((n) => !n.isRead)
        .forEach((n) => {
          batch.update(doc(db, 'notifications', n.id), { isRead: true })
        })
      await batch.commit()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}
