// components/UserViewModal.tsx
import React from "react";
import {
  XMarkIcon,
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface User {
  email: string;
  roles: string[];
  fullName: string;
  userId: string;
  contact: string;
  gender: string;
  profileImagePath?: string;
  firstLogin?: boolean;
}

interface UserViewModalProps {
  user: User | null;
  onClose: () => void;
  onEdit: (email: string) => void;
  onDelete: (userId: string) => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({
  user,
  onClose,
  onEdit, // Now accepting an email to pass to the parent
  onDelete, // Now accepting a userId to pass to the parent
}) => {
  if (!user) return null;

  const formatRole = (role: string): string => {
    return role
      .replace("ROLE_", "")
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 relative transform scale-100 opacity-100 animate-scale-up border border-gray-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={onClose}
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1.5">User Profile</h2>
          <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="flex justify-center mb-6">
          {user.profileImagePath ? (
            <img
              src={user.profileImagePath}
              alt={`${user.fullName}'s Profile`}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-800 shadow-lg ring-1 ring-indigo-500/50"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center shadow-lg border-4 border-gray-800 text-indigo-400 text-5xl font-bold">
              {user.fullName ? (
                user.fullName.charAt(0).toUpperCase()
              ) : (
                <UserCircleIcon className="w-20 h-20 text-gray-500" />
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {[
            { label: "Full Name", value: user.fullName },
            { label: "Email", value: user.email },
            { label: "Gender", value: user.gender },
            { label: "Phone", value: user.contact },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gray-800 p-3 rounded-lg border border-gray-700"
            >
              <h3 className="font-medium text-gray-400 text-xs mb-1">
                {item.label}
              </h3>
              <p className="font-semibold text-white text-base">
                {item.value || "N/A"}
              </p>
            </div>
          ))}

          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <h3 className="font-medium text-gray-400 text-xs mb-1">Role</h3>
            <p className="font-semibold text-white text-base">
              <span className="inline-flex items-center rounded-full bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                {user.roles?.[0] ? formatRole(user.roles[0]) : "N/A"}
              </span>
            </p>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <h3 className="font-medium text-gray-400 text-xs mb-1">
              First Login
            </h3>
            <p className="font-semibold text-white text-base">
              {user.firstLogin ? (
                <span className="text-green-400">Yes</span>
              ) : (
                <span className="text-red-400">No</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <button
            onClick={() => onDelete(user.userId)} // Pass userId to onDelete
            className="flex items-center px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 hover:text-white rounded-lg transition-colors duration-200 border border-red-800/50"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
          <button
            onClick={() => onEdit(user.userId)} // Pass email to onEdit
            className="flex items-center px-4 py-2 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-lg transition-colors duration-200 border border-indigo-800/50"
          >
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;
