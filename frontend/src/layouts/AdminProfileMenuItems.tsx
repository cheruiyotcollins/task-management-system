// src/components/navbar/AdminProfileMenuItems.tsx
import { Menu } from "@headlessui/react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../src/utils/classNames";

export const AdminProfileMenuItems = () => {
  return (
    <>
      <Menu.Item>
        {({ active }) => (
          <Link
            to="/admin/dashboard"
            className={classNames(
              active ? "bg-indigo-50" : "",
              "group flex items-center px-4 py-2 text-sm text-gray-700 hover:text-indigo-600"
            )}
          >
            <ChartBarIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
            Admin Dashboard
          </Link>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <Link
            to="/admin/tasks"
            className={classNames(
              active ? "bg-indigo-50" : "",
              "group flex items-center px-4 py-2 text-sm text-gray-700 hover:text-indigo-600"
            )}
          >
            <ClipboardDocumentListIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
            Manage Tasks
          </Link>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <Link
            to="/admin/users"
            className={classNames(
              active ? "bg-indigo-50" : "",
              "group flex items-center px-4 py-2 text-sm text-gray-700 hover:text-indigo-600"
            )}
          >
            <UsersIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
            Manage Users
          </Link>
        )}
      </Menu.Item>
    </>
  );
};
