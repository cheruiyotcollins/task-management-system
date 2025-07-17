import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useAppSelector } from "../../store/hook";
import { useAppDispatch } from "../../store/hook";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleTask } from "../../store/tasks/actions";
import { RootState } from "../../store/reducers";
import Loader from "../../common/components/Loader";
import { ITask } from "../../interfaces/Task";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

const TaskDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const task: ITask | null = useAppSelector(
    (state: RootState) => state.tasks.singleTask
  );

  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(getSingleTask(id, () => setLoading(false)));
    } else {
      console.warn("Task ID is undefined. Cannot fetch single task.");
      setLoading(false);
    }
  }, [dispatch, id]);

  const toggleBookmarkStatus = () => {
    if (task?.id) {
      dispatch(toggleBookmark(task.id));
      setIsBookmarked(!isBookmarked);
      toast.info(
        !isBookmarked ? "Added to favorites" : "Removed from favorites"
      );
    }
  };

  const shareTask = () => {
    if (navigator.share) {
      navigator
        .share({
          title: task?.title,
          text: `Check out this task: ${task?.title}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-gray-800"
      >
        {/* Sticky Navigation Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={toggleBookmarkStatus}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isBookmarked ? (
                  <FaHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <FaRegHeart className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={shareTask}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiShare2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {task?.title}
            </h1>

            <div className="text-sm text-gray-500 mb-4">
              Status:{" "}
              <span
                className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                  task?.status === "DONE" // Change "Completed" to "DONE"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {/* You might want to display a more user-friendly string here based on the status */}
                {task?.status === "DONE" ? "Completed" : "In Progress/To Do"}
              </span>
              {task?.dueDate && (
                <span className="ml-4">
                  Due:{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </span>
              )}
            </div>

            <div className="text-gray-700 leading-relaxed">
              <p>{task?.description || "No description provided."}</p>
            </div>

            {task?.assignedTo && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  Assigned To
                </h2>
                <p className="text-gray-600">{task.assignedTo}</p>
              </div>
            )}

            {task?.priority && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">
                  Priority
                </h2>
                <p className="text-gray-600">{task.priority}</p>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default TaskDetails;
function toggleBookmark(id: string): any {
  throw new Error("Function not implemented.");
}
