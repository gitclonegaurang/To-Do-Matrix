"use client"

import { useState, useEffect } from "react"
import TaskItem from "./TaskItem"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"

export default function TaskMatrix({ onDateChange, userId }) {
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    fetchTasks()
  }, [selectedDate]) // Removed userId from dependencies

  useEffect(() => {
    const channel = supabase
      .channel("tasks_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchTasks = async () => {
    console.log("Fetching tasks for date:", selectedDate)
    const { data, error } = await supabase.from("tasks").select("*").eq("date", selectedDate).eq("user_id", userId)
    if (error) {
      console.error("Error fetching tasks:", error)
    } else {
      console.log("Fetched tasks:", data)
      setTasks(data)
    }
  }

  const updateTask = async (updatedTask) => {
    const today = format(new Date(), "yyyy-MM-dd")
    if (selectedDate !== today) {
      console.log("Cannot update tasks from previous dates")
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updatedTask)
      .eq("id", updatedTask.id)
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating task:", error)
    } else {
      console.log("Task updated:", updatedTask)
      fetchTasks()
    }
  }

  const deleteTask = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

    if (error) {
      console.error("Error deleting task:", error)
    } else {
      console.log("Task deleted:", taskId)
      fetchTasks()
    }
  }

  const carryForwardTasks = async () => {
    const unfinishedTasks = tasks.filter((task) => !task.completed)
    const nextDay = format(parseISO(selectedDate).setDate(parseISO(selectedDate).getDate() + 1), "yyyy-MM-dd")

    for (const task of unfinishedTasks) {
      const { error } = await supabase.from("tasks").insert({ ...task, date: nextDay, id: undefined, user_id: userId })

      if (error) {
        console.error("Error carrying forward task:", error)
      }
    }

    setSelectedDate(nextDay)
    onDateChange(nextDay)
  }

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate)
    onDateChange(newDate)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="border rounded p-2"
        />
        {selectedDate === format(new Date(), "yyyy-MM-dd") && (
          <Button onClick={carryForwardTasks}>Carry Forward Unfinished Tasks</Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-red-100 p-2">
          <h2 className="font-bold">Urgent & Important</h2>
          {tasks
            .filter((task) => task.urgent && task.important)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                isEditable={selectedDate === format(new Date(), "yyyy-MM-dd")}
              />
            ))}
        </div>
        <div className="bg-yellow-100 p-2">
          <h2 className="font-bold">Urgent & Not Important</h2>
          {tasks
            .filter((task) => task.urgent && !task.important)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                isEditable={selectedDate === format(new Date(), "yyyy-MM-dd")}
              />
            ))}
        </div>
        <div className="bg-green-100 p-2">
          <h2 className="font-bold">Not Urgent & Important</h2>
          {tasks
            .filter((task) => !task.urgent && task.important)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                isEditable={selectedDate === format(new Date(), "yyyy-MM-dd")}
              />
            ))}
        </div>
        <div className="bg-blue-100 p-2">
          <h2 className="font-bold">Not Urgent & Not Important</h2>
          {tasks
            .filter((task) => !task.urgent && !task.important)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                isEditable={selectedDate === format(new Date(), "yyyy-MM-dd")}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

