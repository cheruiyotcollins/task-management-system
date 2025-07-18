import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { useNavigate } from "react-router-dom";
import { createTask } from "../../store/tasks/actions";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { fetchAllUsers } from "../../store/auth/actions";
import { NewTaskDto, TaskPriority, TaskStatus } from "../../interfaces/Task";

const AddTaskPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useAppSelector((state) => ({
    users: state.auth.currentUser,
    loading: state.auth.isLoggedIn,
    error: state.auth.refreshToken,
  }));

  const [formData, setFormData] = useState<NewTaskDto>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    assigneeId: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const page = 0;
    const size = 10;
    const sort = "fullName,ASC";
    const searchQuery = "";

    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "assigneeId" ? value || undefined : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await dispatch(createTask(formData));
      if (result?.success) {
        toast.success("Task created successfully!");
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl w-full mx-auto bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700"
      >
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 text-white">
          <h1 className="text-3xl font-extrabold">Create New Task</h1>
          <p className="text-blue-200 mt-1">
            Fill in the details below to add a new task
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition duration-200"
              required
              placeholder="e.g., Implement user authentication"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition duration-200"
              placeholder="Detailed description of the task..."
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition duration-200"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition duration-200"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label
              htmlFor="assigneeId"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Assign To
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition duration-200"
              disabled={
                usersLoading ||
                (usersError !== undefined && usersError !== null)
              } // Modified line
            >
              <option value="">Unassigned</option>
              {usersLoading ? (
                <option disabled>Loading users...</option>
              ) : usersError ? ( // This `usersError` check is fine for conditional rendering
                <option disabled>Error loading users</option>
              ) : (
                users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))
              )}
            </select>
            {usersError && (
              <p className="mt-1 text-sm text-red-400">{usersError}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <motion.button
              type="button"
              onClick={() => navigate("/tasks")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-gray-700 text-gray-100 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2.5 rounded-lg shadow-md text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
                isSubmitting
                  ? "bg-blue-800 disabled:opacity-70 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTaskPage;
