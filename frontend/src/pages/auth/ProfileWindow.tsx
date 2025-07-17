import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/hook";
import { fetchCurrentUser, logOut } from "../../store/auth/actions";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface CurrentUserDto {
  name: string;
  email: string;
  role: string;
  gender: string;
  contact: string;
  profileImagePath?: string;
  lastLogin?: string;
}

interface ProfileWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const profileVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const avatarVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const ProfileWindow: React.FC<ProfileWindowProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [hasFetched, setHasFetched] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const handleNavigateToPreferences = () => {
    navigate("/account/preferences");
    onClose();
  };
  const handleNavigateToEditPage = () => {
    navigate("/profile/edit");
  };

  useEffect(() => {
    if (!isOpen || hasFetched) return;

    setLoading(true);
    setError(null);
    dispatch(
      fetchCurrentUser(
        (data) => {
          setUser(data);
          setLoading(false);
          setHasFetched(true);
        },
        (err) => {
          console.error(err);
          setError("Failed to fetch user profile.");
          setLoading(false);
          setHasFetched(true);
        }
      )
    );
  }, [dispatch, isOpen, hasFetched]);

  useEffect(() => {
    if (!isOpen) {
      setHasFetched(false);
      setUser(null);
    }
  }, [isOpen]);

  const getAvatarText = () =>
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLogout = () => {
    dispatch(
      logOut(() => {
        onClose();
      })
    );
  };
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose(); // Close the profile window
    navigate("/products"); // Navigate to products page
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-16 right-4 z-50"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={profileVariants}
        >
          <div className="w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/80 hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                onClick={handleClose}
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-center text-white relative">
                <div className="absolute inset-0 bg-black/10" />
                <motion.div
                  className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center relative z-1 border-2 border-white"
                  variants={avatarVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {user?.profileImagePath && !avatarError ? (
                    <img
                      src={user.profileImagePath}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-xl font-semibold text-indigo-700">
                      {getAvatarText()}
                    </span>
                  )}
                </motion.div>
                <motion.h2
                  className="mt-4 text-xl font-bold relative z-1"
                  variants={itemVariants}
                  custom={0}
                >
                  {loading ? "Loading..." : user?.name || "User"}
                </motion.h2>
                <motion.p
                  className="text-xs text-indigo-100 mt-1 relative z-1 flex items-center justify-center"
                  variants={itemVariants}
                  custom={1}
                >
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  {loading ? "..." : user?.role || "Role"}
                </motion.p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === "profile"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium ${
                    activeTab === "settings"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {error ? (
                  <motion.div
                    className="bg-red-50 text-red-700 p-3 rounded-md text-sm"
                    variants={itemVariants}
                    custom={2}
                  >
                    {error}
                  </motion.div>
                ) : loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        variants={itemVariants}
                        custom={i + 2}
                      />
                    ))}
                  </div>
                ) : activeTab === "profile" ? (
                  <motion.div
                    className="space-y-4 text-sm"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      className="pb-2 border-b border-gray-100"
                      variants={itemVariants}
                      custom={2}
                    >
                      <h3 className="font-medium text-gray-700">
                        Personal Information
                      </h3>
                    </motion.div>

                    <motion.div
                      className="flex items-start"
                      variants={itemVariants}
                      custom={3}
                    >
                      <EnvelopeIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-gray-800">{user?.email}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start"
                      variants={itemVariants}
                      custom={4}
                    >
                      <UserIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-gray-800">
                          {user?.gender || "Not specified"}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start"
                      variants={itemVariants}
                      custom={5}
                    >
                      <PhoneIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-gray-800">
                          {user?.contact || "Not provided"}
                        </p>
                      </div>
                    </motion.div>

                    {user?.lastLogin && (
                      <motion.div
                        className="pt-2 border-t border-gray-100 text-xs text-gray-500"
                        variants={itemVariants}
                        custom={6}
                      >
                        Last login: {formatLastLogin(user.lastLogin)}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-4 text-sm"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      className="pb-2 border-b border-gray-100"
                      variants={itemVariants}
                      custom={2}
                    >
                      <h3 className="font-medium text-gray-700">
                        Account Settings
                      </h3>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      variants={itemVariants}
                      custom={3}
                      onClick={handleNavigateToPreferences}
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <span>Account Preferences</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      variants={itemVariants}
                      custom={4}
                      onClick={handleNavigateToEditPage}
                    >
                      <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <span>Edit Profile</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      variants={itemVariants}
                      custom={5}
                    >
                      <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <span>Privacy Settings</span>
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <motion.div
                className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between"
                variants={itemVariants}
                custom={7}
              >
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  Need help?
                </button>
                <button
                  className="flex items-center text-sm text-red-600 hover:text-red-800"
                  onClick={handleLogout}
                >
                  <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-1" />
                  Sign out
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileWindow;
