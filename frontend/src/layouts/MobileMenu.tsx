// components/MobileMenu.tsx
import { Disclosure } from "@headlessui/react";
import {
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  UserIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import React from "react";
import { IUser } from "../interfaces/Auth";

const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

interface MobileMenuProps {
  isAdmin: boolean;
  isUser: boolean;
  closeMobileMenu: () => void;
  isLoggedIn: boolean;
  user: IUser | null;
  handleLogOut: (e: React.MouseEvent) => void;
  getInitials: (name?: string) => string;
  isActive: (path: string) => boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isAdmin,
  isUser,
  closeMobileMenu,
  isLoggedIn,
  user,
  handleLogOut,
  getInitials,
  isActive,
}) => {
  return (
    <Disclosure.Panel className="sm:hidden bg-gradient-to-b from-indigo-800 to-purple-900 shadow-xl">
      <div className="px-4 pt-5 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            TaskManager
          </h1>
          <Disclosure.Button
            className="p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700"
            onClick={closeMobileMenu}
          >
            <XMarkIcon className="h-6 w-6" />
          </Disclosure.Button>
        </div>

        {/* User Info */}
        {isLoggedIn && user && (
          <div className="flex items-center space-x-3 border-b border-indigo-700 pb-4">
            {user.profileImagePath ? (
              <img
                className="h-10 w-10 rounded-full border-2 border-white"
                src={user.profileImagePath}
                alt={user.fullName}
              />
            ) : (
              <div className="h-10 w-10 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-white text-lg font-medium">
                {getInitials(user.fullName)}
              </div>
            )}
            <div>
              <div className="text-base font-medium text-white">
                {user.fullName}
              </div>
              <div className="text-sm font-medium text-indigo-200">
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-1">
          {/* Home/Dashboard */}
          <Disclosure.Button
            as={Link}
            to="/dashboard"
            onClick={closeMobileMenu}
            className={classNames(
              isActive("/dashboard")
                ? "bg-indigo-900 text-white"
                : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
              "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            )}
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
            Dashboard
          </Disclosure.Button>

          {/* Admin Links */}
          {isAdmin && (
            <>
              {/* Task Management Dropdown */}
              <Disclosure as="div" className="w-full">
                {({ open }: { open: boolean }) => (
                  <>
                    <Disclosure.Button
                      className={classNames(
                        isActive("/admin/tasks") || isActive("/admin/tasks/new")
                          ? "bg-indigo-900 text-white"
                          : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                        "flex justify-between items-center w-full px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                      )}
                    >
                      <div className="flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                        Task Management
                      </div>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="pl-8 pt-2 space-y-1">
                      <Disclosure.Button
                        as={Link}
                        to="/admin/tasks"
                        onClick={closeMobileMenu}
                        className={classNames(
                          isActive("/admin/tasks")
                            ? "bg-indigo-800 text-white"
                            : "text-indigo-200 hover:bg-indigo-700 hover:text-white",
                          "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        )}
                      >
                        All Tasks
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/admin/tasks/new"
                        onClick={closeMobileMenu}
                        className={classNames(
                          isActive("/admin/tasks/new")
                            ? "bg-indigo-800 text-white"
                            : "text-indigo-200 hover:bg-indigo-700 hover:text-white",
                          "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        )}
                      >
                        <PlusCircleIcon className="h-4 w-4 mr-2" />
                        Create Task
                      </Disclosure.Button>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>

              {/* Analytics */}
              <Disclosure.Button
                as={Link}
                to="/admin/analytics"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/admin/analytics")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <ChartBarIcon className="h-5 w-5 mr-3" />
                Analytics
              </Disclosure.Button>

              {/* User Management */}
              <Disclosure.Button
                as={Link}
                to="/admin/users"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/admin/users") || isActive("/admin/users/new")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <UsersIcon className="h-5 w-5 mr-3" />
                Manage Users
              </Disclosure.Button>
            </>
          )}

          {/* Customer/User Links */}
          {isUser && (
            <>
              <Disclosure.Button
                as={Link}
                to="/customer/tasks"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/customer/tasks")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                My Tasks
              </Disclosure.Button>
            </>
          )}

          {/* Common User Actions */}
          {isLoggedIn && (
            <>
              <Disclosure.Button
                as={Link}
                to="/profile"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/profile")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <UserIcon className="h-5 w-5 mr-3" />
                Your Profile
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/settings/profile"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/settings/profile")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <Cog6ToothIcon className="h-5 w-5 mr-3" />
                Profile Settings
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/settings/password"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/settings/password")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <Cog6ToothIcon className="h-5 w-5 mr-3" />
                Change Password
              </Disclosure.Button>
              <Disclosure.Button
                as="button"
                onClick={(e) => {
                  handleLogOut(e);
                  closeMobileMenu();
                }}
                className="text-indigo-100 hover:bg-red-700 hover:text-white flex items-center w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </Disclosure.Button>
            </>
          )}

          {/* Guest Links */}
          {!isLoggedIn && (
            <>
              <Disclosure.Button
                as={Link}
                to="/login"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/login")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <UserIcon className="h-5 w-5 mr-3" />
                Login
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                to="/register"
                onClick={closeMobileMenu}
                className={classNames(
                  isActive("/register")
                    ? "bg-indigo-900 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
                  "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                )}
              >
                <PlusCircleIcon className="h-5 w-5 mr-3" />
                Register
              </Disclosure.Button>
            </>
          )}
        </div>
      </div>
    </Disclosure.Panel>
  );
};

export default MobileMenu;
