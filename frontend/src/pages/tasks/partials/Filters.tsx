import { Disclosure } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  MinusSmallIcon,
  PlusSmallIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ITaskFilterParams, TaskStatus } from "../../../interfaces/Task";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { RootState } from "../../../store/reducers";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { fetchAllUsers } from "../../../store/auth/actions";
import { IUser } from "../../../interfaces/Auth";

interface Props {
  filterParams: ITaskFilterParams;
  handleReset: () => void;
  handleSearch: (query: string) => void;
  handleStatusChange: (status: TaskStatus | undefined) => void;
  handleAssigneeChange: (assigneeId: string | undefined) => void;
  handlePriorityChange: (priority: string | null) => void;
  mobileFiltersOpen: boolean;
  isAdmin?: boolean;
}

const Filters: React.FC<Props> = ({
  filterParams,
  handleReset,
  handleSearch,
  handleStatusChange,
  handleAssigneeChange,
  handlePriorityChange,
  isAdmin = false,
}) => {
  const dispatch = useAppDispatch();

  // Safely access auth state with proper typing
  const authState = useAppSelector((state: RootState) => state.auth);
  const users = ("users" in authState ? authState.users : []) as IUser[];
  const currentUser = authState.currentUser as IUser | null;
  const loading = authState.currentUser;
  const error = authState.error;

  const [searchValue, setSearchValue] = useState<string>(filterParams.q || "");

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const debouncedHandleSearch = useRef(
    debounce((query: string) => {
      handleSearch(query);
    }, 300)
  ).current;

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchValue(query);
      debouncedHandleSearch(query);
    },
    [debouncedHandleSearch]
  );

  const statusOptions = [
    {
      value: "TODO",
      label: "To Do",
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      icon: <ClockIcon className="h-5 w-5" />,
    },
    {
      value: "DONE",
      label: "Done",
      icon: <CheckCircleIcon className="h-5 w-5" />,
    },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const isStatusSelected = useCallback(
    (status: string) => filterParams.status === status,
    [filterParams.status]
  );

  const isAssigneeSelected = useCallback(
    (assigneeId: string) => filterParams.assigneeId === assigneeId,
    [filterParams.assigneeId]
  );

  const isPrioritySelected = useCallback(
    (priority: string) => filterParams.priority === priority,
    [filterParams.priority]
  );

  useEffect(() => {
    if (filterParams.q !== searchValue) {
      setSearchValue(filterParams.q || "");
    }
  }, [filterParams.q]);

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:block bg-white rounded-lg shadow-md p-6 w-64"
    >
      {/* ... (other filter sections remain the same) ... */}

      {/* Assignee Filter */}
      <Disclosure as="div" className="mb-6" defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-indigo-600">
              <div className="flex items-center">
                <span className="mr-2">
                  <UserCircleIcon className="h-5 w-5 text-gray-500" />
                </span>
                Assignee
              </div>
              {open ? (
                <MinusSmallIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <PlusSmallIcon className="h-5 w-5 text-gray-500" />
              )}
            </Disclosure.Button>
            <Disclosure.Panel className="pt-3 pl-7">
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="assignee-all"
                    name="assignee"
                    type="radio"
                    checked={!filterParams.assigneeId}
                    onChange={() => handleAssigneeChange(undefined)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="assignee-all"
                    className="ml-2 text-sm text-gray-700"
                  >
                    All Assignees
                  </label>
                </div>

                {/* For admin users - show all users */}
                {isAdmin &&
                  users.map((user) => (
                    <div key={user.userId} className="flex items-center">
                      <input
                        id={`assignee-${user.userId}`}
                        name="assignee"
                        type="radio"
                        checked={isAssigneeSelected(user.userId)}
                        onChange={() => handleAssigneeChange(user.userId)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`assignee-${user.userId}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {user.fullName || user.email}
                      </label>
                    </div>
                  ))}

                {/* For regular users - show only "My Tasks" option */}
                {!isAdmin && currentUser && (
                  <div className="flex items-center">
                    <input
                      id="assignee-me"
                      name="assignee"
                      type="radio"
                      checked={isAssigneeSelected(currentUser.userId)}
                      onChange={() => handleAssigneeChange(currentUser.userId)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="assignee-me"
                      className="ml-2 text-sm text-gray-700"
                    >
                      My Tasks
                    </label>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* ... (rest of the component remains the same) ... */}
    </motion.form>
  );
};

export default React.memo(Filters);
