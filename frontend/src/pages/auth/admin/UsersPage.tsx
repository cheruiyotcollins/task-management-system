import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  fetchUserByEmail,
  deleteUser,
} from "../../../store/auth/actions";
import { RootState } from "../../../store/reducers";
import { toast } from "react-toastify";
import UserViewModal from "./UserViewModal";
import { useNavigate } from "react-router-dom";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Define the type for a single User object from your API response
// Make sure this matches your IUser from src/interfaces/Auth.ts
interface User {
  email: string;
  roles: string[];
  fullName: string;
  contact: string;
  gender: string;
  userId: string;
  profileImagePath?: string;
  firstLogin: boolean;
}

// Define the type for the state coming from Redux
interface AuthState {
  users: User[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
  currentPage: number; // Ensure these are always numbers
  pageSize: number; // Ensure these are always numbers
}

const UsersPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use optional chaining and nullish coalescing for safe access
  // This is the most direct way to ensure currentPage and pageSize are numbers
  const {
    users,
    loading,
    error,
    totalPages = 0, // Add default to totalPages as well for safety
    currentPage: reduxCurrentPage = 0, // Renamed to avoid conflict if you add local state
    totalElements = 0, // Add default to totalElements
    pageSize: reduxPageSize = 10, // Renamed
  } = useSelector((state: RootState) => state.auth as AuthState);

  // You can keep local state for sortBy, sortDirection, searchTerm
  const [sortBy, setSortBy] = useState<string>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Use the Redux values for your pagination controls and API calls
  const currentPage = reduxCurrentPage;
  const pageSize = reduxPageSize;

  // --- Debounce Search Term ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const handleFetchUsers = useCallback(
    (
      pageToFetch: number,
      sizeToFetch: number,
      sortString: string,
      searchQuery: string
    ) => {
      // Log values right before dispatching to confirm
      console.log(
        `Workspaceing users: page=${pageToFetch}, size=${sizeToFetch}, sort=${sortString}, search=${searchQuery}`
      );
      dispatch(
        fetchAllUsers(pageToFetch, sizeToFetch, sortString, searchQuery) as any
      );
    },
    [dispatch]
  );

  useEffect(() => {
    const currentSort = `${sortBy},${sortDirection}`;
    // Pass the ensured-to-be-number values
    handleFetchUsers(currentPage, pageSize, currentSort, debouncedSearchTerm);
  }, [
    handleFetchUsers,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    debouncedSearchTerm,
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
      const currentSort = `${sortBy},${sortDirection}`;
      handleFetchUsers(newPage, pageSize, currentSort, debouncedSearchTerm);
    }
  };

  const handleSort = (column: string) => {
    let newSortDirection: "asc" | "desc" = "asc";
    if (sortBy === column) {
      newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    setSortBy(column);
    setSortDirection(newSortDirection);
    // When sorting, typically reset to the first page (0)
    if (currentPage !== 0) {
      handlePageChange(0); // This will trigger a fetch via useEffect
    } else {
      const currentSort = `${column},${newSortDirection}`;
      handleFetchUsers(currentPage, pageSize, currentSort, debouncedSearchTerm);
    }
  };

  const handleViewUser = (userId: string) => {
    dispatch(
      fetchUserByEmail(
        userId,
        (user: User) => setSelectedUser(user),
        () => toast.error("Failed to fetch user details.")
      ) as any
    );
  };

  const handleEdit = (email: string) => {
    setSelectedUser(null);
    navigate(`/admin/users/edit/${email}`);
  };

  const handleDelete = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      setSelectedUser(null);
      try {
        await dispatch(deleteUser(userId) as any);
        handleFetchUsers(
          currentPage,
          pageSize,
          `${sortBy},${sortDirection}`,
          debouncedSearchTerm
        );
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const formatRole = (role: string): string => {
    return role
      .replace("ROLE_", "")
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    // Use the potentially defaulted totalPages for safety
    if (totalPages <= 1) return [];

    const maxPageButtons = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(0, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]); // Dependencies are now guaranteed numbers

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-gray-800 shadow-xl rounded-lg p-6 lg:p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-3xl font-extrabold text-white flex items-center">
            <UserGroupIcon className="h-8 w-8 mr-3 text-indigo-400" />
            All Users
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600 w-full sm:w-64 transition-all duration-200"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
            <p className="text-lg">Fetching user data...</p>
          </div>
        )}

        {error && (
          <div
            className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded relative my-6"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => {
                /* If you have a Redux action to clear error state, dispatch it here */
              }}
            >
              <XMarkIcon className="fill-current h-6 w-6 text-red-400" />
            </span>
          </div>
        )}

        {!loading && !error && (
          <>
            {users && users.length > 0 ? (
              <div className="overflow-x-auto relative shadow-lg sm:rounded-lg border border-gray-700">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="py-3 px-6 cursor-pointer hover:bg-gray-600 transition-colors duration-150"
                        onClick={() => handleSort("fullName")}
                      >
                        <div className="flex items-center">
                          Name{" "}
                          {sortBy === "fullName" &&
                            (sortDirection === "asc" ? (
                              <ArrowUpIcon className="ml-1 w-3 h-3" />
                            ) : (
                              <ArrowDownIcon className="ml-1 w-3 h-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-6 cursor-pointer hover:bg-gray-600 transition-colors duration-150"
                        onClick={() => handleSort("gender")}
                      >
                        <div className="flex items-center">
                          Gender{" "}
                          {sortBy === "gender" &&
                            (sortDirection === "asc" ? (
                              <ArrowUpIcon className="ml-1 w-3 h-3" />
                            ) : (
                              <ArrowDownIcon className="ml-1 w-3 h-3" />
                            ))}
                        </div>
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Phone No
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-6 cursor-pointer hover:bg-gray-600 transition-colors duration-150"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Email{" "}
                          {sortBy === "email" &&
                            (sortDirection === "asc" ? (
                              <ArrowUpIcon className="ml-1 w-3 h-3" />
                            ) : (
                              <ArrowDownIcon className="ml-1 w-3 h-3" />
                            ))}
                        </div>
                      </th>
                      <th scope="col" className="py-3 px-6">
                        Role
                      </th>
                      <th scope="col" className="py-3 px-6 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: User, index) => (
                      <tr
                        key={user.userId || user.email}
                        className={`${
                          index % 2 === 0 ? "bg-gray-800" : "bg-gray-800/80"
                        } border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150`}
                      >
                        <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                          {user.fullName || "N/A"}
                        </td>
                        <td className="py-4 px-6">{user.gender || "N/A"}</td>
                        <td className="py-4 px-6">{user.contact || "N/A"}</td>
                        <td className="py-4 px-6">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900/30 text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                            {user.roles?.[0]
                              ? formatRole(user.roles[0])
                              : "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleViewUser(user.userId)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-700 rounded-lg text-gray-300 text-lg border border-dashed border-gray-600 mt-6">
                No users found matching your criteria.
              </div>
            )}

            {totalPages > 1 && ( // Only show pagination if more than 1 page
              <nav
                className="flex items-center justify-between border-t border-gray-700 bg-gray-800 px-4 py-3 sm:px-6 mt-6 rounded-lg shadow-md"
                aria-label="Pagination"
              >
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing{" "}
                      <span className="font-medium">
                        {currentPage * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>{" "}
                      of <span className="font-medium">{totalElements}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-700 focus:z-20 focus:outline-offset-0 transition-colors duration-200
                              ${
                                pageNumber === currentPage
                                  ? "bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  : "text-gray-300 hover:bg-gray-700"
                              }
                              `}
                        >
                          {pageNumber + 1}{" "}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </nav>
                  </div>
                </div>
              </nav>
            )}
          </>
        )}
      </div>

      {selectedUser && (
        <UserViewModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default UsersPage;
