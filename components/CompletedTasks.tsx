"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompletedTasksProps {
  selectedDate: string;
  userId: string;
}

export default function CompletedTasks({ selectedDate, userId }: CompletedTasksProps) {
  interface Task {
    id: string;
    task: string;
    // Add other fields as necessary
  }

  const [completedTasks, setCompletedTasks] = useState<Task[]>([])

  const fetchCompletedTasks = useCallback(async () => {
    console.log("Fetching completed tasks for date:", selectedDate)
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("date", selectedDate)
      .eq("completed", true)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching completed tasks:", error)
    } else {
      console.log("Fetched completed tasks:", data)
      setCompletedTasks(data)
    }
  }, [selectedDate, userId])

  useEffect(() => {
    fetchCompletedTasks()
  }, [fetchCompletedTasks])

  useEffect(() => {
    const channel = supabase
      .channel("completed_tasks_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        fetchCompletedTasks,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchCompletedTasks])

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

