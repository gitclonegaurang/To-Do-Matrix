import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"

export default function TaskItem({ task, updateTask, deleteTask, isEditable }) {
  const handleComplete = () => {
    if (isEditable) {
      updateTask({ ...task, completed: !task.completed })
    }
  }

  const handleDelete = () => {
    if (isEditable) {
      deleteTask(task.id)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleComplete}
          id={`task-${task.id}`}
          disabled={!isEditable}
        />
        <label htmlFor={`task-${task.id}`} className={`ml-2 ${task.completed ? "line-through" : ""}`}>
          {task.task}
        </label>
      </div>
      {isEditable && (
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

