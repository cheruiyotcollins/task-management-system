import { debounce } from "lodash";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import Loader from "../../common/components/Loader";
import { ITaskFilterParams, ITask } from "../../interfaces/Task";
import { filterTasks, getTasks } from "../../store/tasks/actions";
import { RootState } from "../../store/reducers";
import Filters from "./partials/Filters";
import MobileFiltersDialog from "./partials/MobileFiltersDialog";
import SingleTask from "./partials/SingleTask";
import SortOptions from "./partials/SortOptions";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiHome,
  FiChevronRight as RightChevron,
  FiPlus,
} from "react-icons/fi";
import { FaSadTear, FaCheckCircle, FaSpinner, FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CreateTaskModal from "./partials/CreateTaskModal";
import { TaskStatus } from "../../interfaces/Task";
import { fetchAllUsers } from "../../store/auth/actions";

const Tasks: React.FC = () => {
  // Authentication context - using the custom hook directly
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Redux state with proper fallbacks
  const tasksState = useAppSelector(
    (state: RootState) => state.tasks.filteredTasks
  );

  // Get tasks array regardless of format
  const tasks = Array.isArray(tasksState)
    ? tasksState
    : tasksState?.tasks || [];

  const allTasks = useAppSelector(
    (state: RootState) => state.tasks.tasks || []
  );
  const dispatch = useAppDispatch();

  // Filter parameters
  const initialFilterParams: ITaskFilterParams = {
    q: "",
    status: undefined,
    assigneeId: isAdmin ? undefined : user?.id,
    sortBy: "",
  };

  const [filterParams, setFilterParams] =
    useState<ITaskFilterParams>(initialFilterParams);

  // Debounced search handler
  const handleSearch = useRef(
    debounce((query: string) => {
      setFilterParams((prev) => ({ ...prev, q: query }));
    }, 300)
  ).current;

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleReset = useCallback(() => {
    setFilterParams(initialFilterParams);
    setSearchQuery("");
    setError(null);
  }, [initialFilterParams]);

  const handleSort = useCallback((sort: string) => {
    setFilterParams((prev) => ({ ...prev, sortBy: sort }));
  }, []);

  const handleStatusChange = useCallback((status: TaskStatus | undefined) => {
    setFilterParams((prev) => ({
      ...prev,
      status,
    }));
  }, []);

  const handleAssigneeChange = useCallback((assigneeId: string | undefined) => {
    setFilterParams((prev) => ({
      ...prev,
      assigneeId,
    }));
  }, []);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await dispatch(getTasks());

        if (isAdmin) {
          await dispatch(
            fetchAllUsers(
              0, // page
              100, // size
              "fullName,asc", // sort
              "" // searchQuery (optional)
            )
          );
        }

        // Initial filter after tasks load
        dispatch(filterTasks(initialFilterParams));
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
        console.error("Task fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, isAdmin, initialFilterParams]);

  // Apply filters when params change
  useEffect(() => {
    if (allTasks.length > 0) {
      dispatch(filterTasks(filterParams));
    }
    setSearchQuery(filterParams.q || "");
  }, [dispatch, filterParams, allTasks.length]);

  // Group tasks by status for kanban view
  const groupedTasks = {
    [TaskStatus.TODO]: tasks.filter((task) => task.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS
    ),
    [TaskStatus.DONE]: tasks.filter((task) => task.status === TaskStatus.DONE),
  };

  const statusIcons = {
    [TaskStatus.TODO]: <FaCircle className="text-gray-400" />,
    [TaskStatus.IN_PROGRESS]: (
      <FaSpinner className="text-blue-500 animate-spin" />
    ),
    [TaskStatus.DONE]: <FaCheckCircle className="text-green-500" />,
  };

  // Memoized task count display
  const taskCountDisplay = `${tasks.length} ${
    tasks.length === 1 ? "task" : "tasks"
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {loading && <Loader />}
      {error && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 bg-red-100 border-b-2 border-red-500 text-red-700 p-4 z-50 flex justify-between items-center shadow-md"
        >
          <p className="font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-4 px-3 py-1 rounded-md bg-red-200 hover:bg-red-300 transition-colors"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      <MobileFiltersDialog
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
        handleSearch={handleSearch}
        handleStatusChange={handleStatusChange}
        handleAssigneeChange={handleAssigneeChange}
        filterParams={filterParams}
        handleReset={handleReset}
        isAdmin={isAdmin}
      />

      {/* Sticky Header */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -16 : 0 }}
        className={`sticky top-0 z-30 bg-white shadow-sm transition-all duration-300 ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 mb-3 md:mb-0">
              <Link
                to="/"
                className="flex items-center hover:text-indigo-600 transition-colors"
              >
                <FiHome className="h-4 w-4 mr-1" />
                Home
              </Link>
              <RightChevron className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">Tasks</span>
            </div>

            <div className="w-full md:w-1/2 lg:w-1/3">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-2 pl-12 pr-4 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
                  placeholder="Search tasks by title or description"
                  type="search"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Filter/Sort Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between pt-8 pb-6"
        >
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {isAdmin ? "Manage All Tasks" : "My Tasks"}
            </h1>
            <span className="ml-4 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium shadow-inner">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
            <SortOptions
              handleSort={handleSort}
              setMobileFiltersOpen={setMobileFiltersOpen}
              currentSort={filterParams.sortBy}
            />
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-indigo-700 hover:shadow-md transition-all"
            >
              <FiPlus className="mr-2" />
              New Task
            </button>
          </div>
        </motion.div>

        {/* Task Grid Section */}
        <section aria-labelledby="tasks-heading" className="pt-6 pb-24">
          <h2 id="tasks-heading" className="sr-only">
            Tasks
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {filtersCollapsed ? "Show" : "Hide"} Filters
                  <FiChevronRight
                    className={`ml-1 h-5 w-5 transform transition-transform ${
                      filtersCollapsed ? "rotate-0" : "rotate-90"
                    }`}
                  />
                </button>
              </div>
              {!filtersCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Filters
                    filterParams={filterParams}
                    handleReset={handleReset}
                    handleSearch={handleSearch}
                    handleStatusChange={handleStatusChange}
                    handleAssigneeChange={handleAssigneeChange}
                    mobileFiltersOpen={false}
                    isAdmin={isAdmin}
                    handlePriorityChange={function (
                      priority: string | null
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* Task Display Area */}
            <div className="lg:col-span-3">
              {/* Mobile Filters Toggle */}
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {filtersCollapsed ? "Show" : "Hide"} Filters
                  <FiChevronRight
                    className={`ml-1 h-5 w-5 transform transition-transform ${
                      filtersCollapsed ? "rotate-0" : "rotate-90"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-10">
                {!filtersCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="lg:hidden overflow-hidden"
                  >
                    <Filters
                      filterParams={filterParams}
                      handleReset={handleReset}
                      handleSearch={handleSearch}
                      handleStatusChange={handleStatusChange}
                      handleAssigneeChange={handleAssigneeChange}
                      mobileFiltersOpen={false}
                      isAdmin={isAdmin}
                      handlePriorityChange={function (
                        priority: string | null
                      ): void {
                        throw new Error("Function not implemented.");
                      }}
                    />
                  </motion.div>
                )}

                {/* Task Kanban Board */}
                <div
                  className={
                    filtersCollapsed ? "col-span-full" : "lg:col-span-3"
                  }
                >
                  <AnimatePresence mode="wait">
                    {!Array.isArray(tasks) || tasks.length === 0 ? (
                      <motion.div
                        key="no-tasks"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <FaSadTear className="w-16 h-16 text-indigo-400 mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-medium text-gray-900 mb-2">
                          {!Array.isArray(tasks)
                            ? "Oops! Something went wrong"
                            : "No tasks found"}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                          {!Array.isArray(tasks)
                            ? "We're having trouble loading tasks. Please try again later."
                            : "We couldn't find any tasks matching your criteria. Try adjusting your filters."}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReset}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          {!Array.isArray(tasks) ? "Retry" : "Reset Filters"}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tasks-board"
                        layout
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      >
                        {Object.entries(groupedTasks).map(
                          ([status, statusTasks]) => (
                            <motion.div
                              key={status}
                              layout
                              className="bg-gray-50 rounded-xl p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900 flex items-center">
                                  {statusIcons[status as TaskStatus]}
                                  <span className="ml-2 capitalize">
                                    {status.toLowerCase().replace("_", " ")}
                                  </span>
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800">
                                  {statusTasks.length}
                                </span>
                              </div>
                              <div className="space-y-4">
                                <AnimatePresence>
                                  {statusTasks.map((task: ITask) => (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      whileHover={{ y: -2 }}
                                    >
                                      <SingleTask
                                        task={task}
                                        isAdmin={isAdmin}
                                      />
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMobileFiltersOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden z-40 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <FiFilter className="w-6 h-6" />
      </motion.button>

      <CreateTaskModal
        open={createModalOpen}
        setOpen={setCreateModalOpen} // Use setOpen instead of onClose
      />
    </div>
  );
};

export default Tasks;
