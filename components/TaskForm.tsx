"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  userId: string;
}

export default function TaskForm({ selectedDate, onDateChange, userId }: TaskFormProps) {
  const [task, setTask] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);

  const handleAddTask = async () => {
    if (!task) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          task,
          urgent,
          important,
          completed: false,
          date: selectedDate,
          user_id: userId,
        });

      if (error) throw error;

      setTask("");
      setUrgent(false);
      setImportant(false);
      onDateChange(selectedDate); // Refresh tasks
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="New Task"
        className="border rounded p-2 mr-2"
      />
      <label className="mr-2">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
        />
        Urgent
      </label>
      <label className="mr-2">
        <input
          type="checkbox"
          checked={important}
          onChange={(e) => setImportant(e.target.checked)}
        />
        Important
      </label>
      <Button onClick={handleAddTask}>Add Task</Button>
    </div>
  );
}