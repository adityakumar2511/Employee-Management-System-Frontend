'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

export function useDashboardCounters() {
  const [counters, setCounters] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    wfh: 0,
    total: 0,
    lastUpdated: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    const unsubscribe = onSnapshot(
      doc(db, 'dashboard_counters', today),
      (snapshot) => {
        if (snapshot.exists()) {
          setCounters(snapshot.data())
        }
        setLoading(false)
      },
      (err) => {
        console.error('Dashboard counters listener error:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { counters, loading }
}
