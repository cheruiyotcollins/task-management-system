import React from "react";
import { ITask } from "../../../interfaces/Task";
import { TaskStatus } from "../../../interfaces/Task";
import {
  FaCheckCircle,
  FaSpinner,
  FaCircle,
  FaCalendarAlt,
  FaEdit,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAppDispatch } from "../../../store/hook";
import { updateTask } from "../../../store/tasks/actions";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../../../common/components/Avatar";
import PriorityBadge from "../../../common/components/PriorityBadge";
import { format } from "date-fns";

interface SingleTaskProps {
  task: ITask;
  isAdmin: boolean;
}

const SingleTask: React.FC<SingleTaskProps> = ({ task, isAdmin }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth(); // Using the useAuth hook instead of useContext directly

  const statusIcons = {
    [TaskStatus.TODO]: <FaCircle className="text-gray-400" />,
    [TaskStatus.IN_PROGRESS]: (
      <FaSpinner className="text-blue-500 animate-spin" />
    ),
    [TaskStatus.DONE]: <FaCheckCircle className="text-green-500" />,
  };

  const statusClasses = {
    [TaskStatus.TODO]: "bg-gray-100 text-gray-800",
    [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
    [TaskStatus.DONE]: "bg-green-100 text-green-800",
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task?.id) {
      // Add a check to ensure task and taskId exist
      console.error("Task ID is missing for status update.");
      return;
    }
    try {
      await dispatch(
        updateTask(
          task.id, // First argument: taskId
          {
            // Second argument: taskData (Partial<ITask>)
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleAssignToMe = async () => {
    if (!user?.id) {
      console.error("User ID is missing for task assignment.");
      return;
    }
    if (!task?.id) {
      // Add a check to ensure task and taskId exist
      console.error("Task ID is missing for task assignment.");
      return;
    }
    try {
      await dispatch(
        updateTask(task.id, {
          assigneeId: user.id,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const handleEditClick = () => {
    // You can implement edit functionality here
    console.log("Edit task:", task.id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 text-lg line-clamp-2">
            {task.title}
          </h3>
          <PriorityBadge priority={task.priority} />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusClasses[task.status]
              }`}
            >
              {task.status.replace("_", " ")}
            </span>
            {task.dueDate && (
              <div className="flex items-center text-xs text-gray-500">
                <FaCalendarAlt className="mr-1" />
                {format(new Date(task.dueDate), "MMM dd, yyyy")}
              </div>
            )}
          </div>
          {statusIcons[task.status]}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          {task.assignee ? (
            <div className="flex items-center">
              <Avatar
                name={task.assignee.username || "Unknown User"}
                size="sm"
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                {task.assignee.username}
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">Unassigned</div>
          )}

          {isAdmin && !task.assignee && user && (
            <button
              onClick={handleAssignToMe}
              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors"
              disabled={!user} // Disable if no user
            >
              Assign to me
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created: {format(new Date(task.createdAt), "MMM dd, yyyy")}
        </div>

        <div className="flex space-x-2">
          {task.status !== TaskStatus.TODO && (
            <button
              onClick={() => handleStatusChange(TaskStatus.TODO)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Mark as Todo"
              aria-label="Mark as Todo"
            >
              <FaCircle />
            </button>
          )}

          {task.status !== TaskStatus.IN_PROGRESS && (
            <button
              onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
              className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
              title="Mark in Progress"
              aria-label="Mark in Progress"
            >
              <FaSpinner />
            </button>
          )}

          {task.status !== TaskStatus.DONE && (
            <button
              onClick={() => handleStatusChange(TaskStatus.DONE)}
              className="p-1 text-green-500 hover:text-green-700 transition-colors"
              title="Mark as Done"
              aria-label="Mark as Done"
            >
              <FaCheckCircle />
            </button>
          )}

          <button
            onClick={handleEditClick}
            className="p-1 text-indigo-500 hover:text-indigo-700 transition-colors"
            title="Edit Task"
            aria-label="Edit Task"
          >
            <FaEdit />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SingleTask;
