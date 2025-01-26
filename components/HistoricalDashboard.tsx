"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export default function HistoricalDashboard() {
  const [data, setData] = useState([])
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))

  useEffect(() => {
    async function fetchHistoricalData() {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const startDate = formatDate(weekStart)
      const endDate = formatDate(weekEnd)

      console.log(`Fetching historical data from ${startDate} to ${endDate}`)

      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)

      if (error) {
        console.error("Error fetching historical data:", error)
      } else {
        console.log("Fetched tasks:", tasks)
        const chartData = Array.from({ length: 7 }, (_, i) => {
          const currentDate = new Date(weekStart)
          currentDate.setDate(currentDate.getDate() + i)
          const dateString = formatDate(currentDate)
          const dayTasks = tasks.filter((task) => task.date === dateString)
          return {
            date: dateString,
            completed: dayTasks.filter((task) => task.completed).length,
            total: dayTasks.length,
          }
        })
        console.log("New chart data:", chartData)
        setData(chartData)
      }
    }

    fetchHistoricalData()
  }, [weekStart])

  function navigateWeek(direction: number) {
    const newWeekStart = new Date(weekStart)
    newWeekStart.setDate(newWeekStart.getDate() + 7 * direction)
    setWeekStart(newWeekStart)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historical Tasks</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {formatDate(weekStart)} - {formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#8884d8" name="Completed" />
            <Bar dataKey="total" fill="#82ca9d" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

