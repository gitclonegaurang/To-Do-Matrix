import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const config = {
  runtime: "edge",
}

export async function GET() {
  const now = new Date()
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .gte("date", now.toISOString().split("T")[0])
    .is("completed", false)
    .is("ignored", false)

  if (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }

  const reminders = tasks.filter((task) => {
    const taskDate = new Date(task.date)
    const diff = taskDate.getTime() - now.getTime()
    const hours = diff / (1000 * 60 * 60)
    return hours <= 12 && hours > 0
  })

  return NextResponse.json(reminders)
}

