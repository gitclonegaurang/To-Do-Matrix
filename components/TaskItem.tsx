import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function TaskItem({ task, updateTask, isEditable }) {
  const handleComplete = () => {
    if (isEditable) {
      updateTask({ ...task, completed: !task.completed })
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div>
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
    </div>
  )
}

