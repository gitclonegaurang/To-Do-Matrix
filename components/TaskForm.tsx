"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

export default function TaskForm({ selectedDate, onDateChange, userId }) {
  const [task, setTask] = useState("")
  const [date, setDate] = useState(selectedDate || format(new Date(), "yyyy-MM-dd"))
  const [urgent, setUrgent] = useState(false)
  const [important, setImportant] = useState(false)

  useEffect(() => {
    setDate(selectedDate)
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTask = {
      task,
      date,
      urgent,
      important,
      completed: false,
      user_id: userId,
    }
    console.log("Submitting new task:", newTask)
    const { data, error } = await supabase.from("tasks").insert([newTask])

    if (error) {
      console.error("Error inserting task:", error)
    } else {
      console.log("Task inserted successfully:", data)
      setTask("")
      setUrgent(false)
      setImportant(false)
    }
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setDate(newDate)
    onDateChange(newDate)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="space-y-2">
        <Input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Enter task" required />
        <Input type="date" value={date} onChange={handleDateChange} required />
        <div className="flex items-center space-x-2">
          <Checkbox id="urgent" checked={urgent} onCheckedChange={(checked) => setUrgent(checked as boolean)} />
          <Label htmlFor="urgent">Urgent</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="important"
            checked={important}
            onCheckedChange={(checked) => setImportant(checked as boolean)}
          />
          <Label htmlFor="important">Important</Label>
        </div>
        <Button type="submit">Add Task</Button>
      </div>
    </form>
  )
}

