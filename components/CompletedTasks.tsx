"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CompletedTasks({ selectedDate }) {
  const [completedTasks, setCompletedTasks] = useState([])

  useEffect(() => {
    fetchCompletedTasks()

    // Only set up real-time updates for the current date
    const today = new Date().toISOString().split("T")[0]
    if (selectedDate === today) {
      const channel = supabase
        .channel("completed_tasks_channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchCompletedTasks)
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedDate])

  const fetchCompletedTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").eq("date", selectedDate).eq("completed", true)

    if (error) {
      console.error("Error fetching completed tasks:", error)
    } else {
      setCompletedTasks(data)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Completed Tasks for {selectedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {completedTasks.map((task) => (
            <li key={task.id} className="mb-2 p-2 bg-gray-100 rounded">
              {task.task}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

