"use client"

import { useState, useEffect } from "react"
import TaskMatrix from "../components/TaskMatrix"
import TaskForm from "../components/TaskForm"
import DailyDashboard from "../components/DailyDashboard"
import HistoricalDashboard from "../components/HistoricalDashboard"
import CompletedTasks from "../components/CompletedTasks"

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Matrix Todo</h1>
      <TaskForm selectedDate={selectedDate} onDateChange={handleDateChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <TaskMatrix selectedDate={selectedDate} onDateChange={handleDateChange} />
          <CompletedTasks selectedDate={selectedDate} />
        </div>
        <div>
          <DailyDashboard selectedDate={selectedDate} />
          <HistoricalDashboard />
        </div>
      </div>
    </main>
  )
}

