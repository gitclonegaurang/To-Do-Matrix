"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { supabase } from "@/lib/supabase"

interface DailyDashboardProps {
  selectedDate: string;
  userId: string;
}

export default function DailyDashboard({ selectedDate, userId }: DailyDashboardProps) {
  const [data, setData] = useState<{ name: string; value: number }[]>([])

  const fetchTasks = useCallback(async () => {
    console.log("Fetching tasks for date:", selectedDate)
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("date", selectedDate)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching tasks:", error)
    } else {
      console.log("Fetched tasks:", tasks)
      const completed = tasks.filter((task) => task.completed).length
      const remaining = tasks.length - completed
      const newData = [
        { name: "Completed", value: completed },
        { name: "Remaining", value: remaining },
      ]
      console.log("New chart data:", newData)
      setData(newData)
    }
  }, [selectedDate, userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    const channel = supabase
      .channel("daily_tasks_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        fetchTasks,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchTasks])

  const COLORS = ["#0088FE", "#00C49F"]

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Daily Tasks for {selectedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

