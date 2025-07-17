// src/components/navbar/AdminMenuItems.tsx
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../src/utils/classNames";

interface AdminMenuItemsProps {
  isActive: (path: string) => boolean;
}

export const AdminMenuItems: React.FC<AdminMenuItemsProps> = ({ isActive }) => {
  return (
    <>
      {/* Dashboard */}
      <Link
        to="/admin/dashboard"
        className={classNames(
          isActive("/admin/dashboard")
            ? "bg-indigo-900 text-white"
            : "text-indigo-100 hover:bg-indigo-600 hover:text-white",
          "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
        )}
      >
        <ChartBarIcon className="h-5 w-5 mr-2" />
        Dashboard
      </Link>

      {/* Task Management */}
      <Link
        to="/admin/tasks"
        className={classNames(
          isActive("/admin/tasks")
            ? "bg-indigo-900 text-white"
            : "text-indigo-100 hover:bg-indigo-600 hover:text-white",
          "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
        )}
      >
        <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
        Manage Tasks
      </Link>

      {/* User Management */}
      <Link
        to="/admin/users"
        className={classNames(
          isActive("/admin/users")
            ? "bg-indigo-900 text-white"
            : "text-indigo-100 hover:bg-indigo-600 hover:text-white",
          "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
        )}
      >
        <UsersIcon className="h-5 w-5 mr-2" />
        Manage Users
      </Link>

      {/* System Settings */}
      <Link
        to="/admin/settings"
        className={classNames(
          isActive("/admin/settings")
            ? "bg-indigo-900 text-white"
            : "text-indigo-100 hover:bg-indigo-600 hover:text-white",
          "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
        )}
      >
        <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
        Settings
      </Link>
    </>
  );
};
