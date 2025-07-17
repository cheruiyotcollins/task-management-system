// src/components/navbar/CustomerProfileMenuItems.tsx
import { Menu } from "@headlessui/react";
import { Link } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "../../src/utils/classNames";

export const UserProfileMenuItems = () => {
  return (
    <>
      <Menu.Item>
        {({ active }: { active: boolean }) => (
          <Link
            to="/my-tasks"
            className={classNames(
              active ? "bg-indigo-50" : "",
              "group flex items-center px-4 py-2 text-sm text-gray-700 hover:text-indigo-600"
            )}
          >
            <ClipboardDocumentListIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
            My Tasks
          </Link>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }: { active: boolean }) => (
          <Link
            to="/profile/settings"
            className={classNames(
              active ? "bg-indigo-50" : "",
              "group flex items-center px-4 py-2 text-sm text-gray-700 hover:text-indigo-600"
            )}
          >
            <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
            Account Settings
          </Link>
        )}
      </Menu.Item>
    </>
  );
};
