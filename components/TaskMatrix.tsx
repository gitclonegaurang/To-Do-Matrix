"use client";

import { useState, useEffect, useCallback } from "react";
import TaskItem from "./TaskItem";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { format, parseISO, addDays } from "date-fns";
import {Task } from "./types";


interface TaskMatrixProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  userId: string;
}



export default function TaskMatrix({ selectedDate, onDateChange, userId }: TaskMatrixProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    try {
      console.log("Fetching tasks for date:", selectedDate);
      const { data, error } = await supabase
        .from("tasks")
        .select("id, task, urgent, important, completed")
        .eq("date", selectedDate)
        .eq("user_id", userId);

      if (error) throw error;
      setTasks(data || []);
      console.log("Fetched tasks:", data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [selectedDate, userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const channel = supabase
      .channel("tasks_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const updateTask = async (task: Task): Promise<void> => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: task.completed })
        .eq("id", task.id)
        .eq("user_id", userId);

      if (error) throw error;
      console.log("Task updated:", task);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) throw error;
      console.log("Task deleted:", taskId);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const carryForwardTasks = async () => {
    try {
      const unfinishedTasks = tasks.filter((task) => !task.completed);
      const nextDay = format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd");

      for (const task of unfinishedTasks) {
        const { error } = await supabase
          .from("tasks")
          .insert({ ...task, date: nextDay, id: undefined, user_id: userId });

        if (error) throw error;
      }

      onDateChange(nextDay);
    } catch (error) {
      console.error("Error carrying forward tasks:", error);
    }
  };

  const handleDateChange = (newDate: string) => {
    onDateChange(newDate);
  };

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
        {[
          { title: "Urgent & Important", filter: (t: Task) => t.urgent && t.important, bg: "bg-red-100" },
          { title: "Urgent & Not Important", filter: (t: Task) => t.urgent && !t.important, bg: "bg-yellow-100" },
          { title: "Not Urgent & Important", filter: (t: Task) => !t.urgent && t.important, bg: "bg-green-100" },
          { title: "Not Urgent & Not Important", filter: (t: Task) => !t.urgent && !t.important, bg: "bg-blue-100" },
        ].map(({ title, filter, bg }) => (
          <div key={title} className={`${bg} p-2`}>
            <h2 className="font-bold">{title}</h2>
            {tasks.filter(filter).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                isEditable={selectedDate === format(new Date(), "yyyy-MM-dd")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}