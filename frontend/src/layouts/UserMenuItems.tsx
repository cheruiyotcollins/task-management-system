// src/components/navbar/CustomerMenuItems.tsx
import { Link } from "react-router-dom";
import { classNames } from "../utils/classNames"; // Adjust path if necessary

// Define the props interface for UserMenuItems
interface UserMenuItemsProps {
  isActive: (path: string) => boolean;
}

export const UserMenuItems: React.FC<UserMenuItemsProps> = ({ isActive }) => {
  return (
    <Link
      to="/my-tasks"
      className={classNames(
        isActive("/my-tasks")
          ? "bg-indigo-900 text-white"
          : "text-indigo-100 hover:bg-indigo-600 hover:text-white",
        "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
      )}
    >
      My Tasks
    </Link>
  );
};
