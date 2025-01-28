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
import { Session } from "@supabase/supabase-js" // Import the Session type

export default function Home() {
  // Explicitly set the type for useState to Session | null
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch the current session and handle redirects
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session) // Ensure proper access to data.session
      if (!data.session) {
        router.push("/auth")
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push("/auth")
      }
    })

    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe()
  }, [router])

  // Handle date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
  }

  // Handle user sign-out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  // Render a loading state while session is null
  if (!session) {
    return <div>Loading...</div>
  }

  // Main UI
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
