import React from "react";
import { TaskPriority } from "../../interfaces/Task";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityClasses = {
    [TaskPriority.LOW]: "bg-green-100 text-green-800",
    [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
    [TaskPriority.HIGH]: "bg-red-100 text-red-800",
    [TaskPriority.CRITICAL]: "bg-purple-100 text-purple-800",
  };

  const priorityLabels = {
    [TaskPriority.LOW]: "Low",
    [TaskPriority.MEDIUM]: "Medium",
    [TaskPriority.HIGH]: "High",
    [TaskPriority.CRITICAL]: "Critical",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${priorityClasses[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
};

export default PriorityBadge;
