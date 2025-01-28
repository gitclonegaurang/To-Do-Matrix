"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import TaskMatrix from "../components/TaskMatrix"
import TaskForm from "../components/TaskForm"
import DailyDashboard from "../components/DailyDashboard"
import HistoricalDashboard from "../components/HistoricalDashboard"
import CompletedTasks from "../components/CompletedTasks"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) {
        router.push("/auth")
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push("/auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleDateChange = (newDate: string) => {  // Added type 'string' to newDate
    setSelectedDate(newDate)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  if (!session) {
    return null // or a loading spinner
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Matrix Todo</h1>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
      <TaskForm selectedDate={selectedDate} onDateChange={handleDateChange} userId={session.user.id} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <TaskMatrix selectedDate={selectedDate} onDateChange={handleDateChange} userId={session.user.id} />
          <CompletedTasks selectedDate={selectedDate} userId={session.user.id} />
        </div>
        <div>
          <DailyDashboard selectedDate={selectedDate} userId={session.user.id} />
          <HistoricalDashboard userId={session.user.id} />
        </div>
      </div>
    </main>
  )
}
