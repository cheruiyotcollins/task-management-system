import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hook";
import {
  LockClosedIcon,
  EnvelopeIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { changePassword } from "../../store/auth/actions";
import { updatePrivacySettings } from "../../store/auth/actions";
import { updateNotificationSettings } from "../../store/auth/actions";
import { motion } from "framer-motion";

const AccountPreferences = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "security" | "notifications" | "privacy"
  >("security");

  // Security Tab State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    general: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Notifications Tab State
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [notificationError, setNotificationError] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState("");

  // Privacy Tab State
  const [privacyPrefs, setPrivacyPrefs] = useState({
    profileVisibility: "public",
    dataSharing: false,
  });
  const [privacyError, setPrivacyError] = useState("");
  const [privacySuccess, setPrivacySuccess] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Common Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (activeTab === "security") {
      setPasswordForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear errors when typing
      if (passwordErrors[name as keyof typeof passwordErrors]) {
        setPasswordErrors((prev) => ({
          ...prev,
          [name]: "",
          general: "",
        }));
      }
    } else if (activeTab === "notifications") {
      setNotificationPrefs((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else if (activeTab === "privacy") {
      setPrivacyPrefs((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validatePasswordForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      general: "",
    };

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
      isValid = false;
    }

    setPasswordErrors(newErrors);
    return isValid;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setIsLoading(true);
    setPasswordSuccess("");

    try {
      await dispatch(
        changePassword(
          {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
          () => {
            // Success callback
            setPasswordSuccess("Password changed successfully!");
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setTimeout(() => setPasswordSuccess(""), 5000);
          },
          (error: string) => {
            setPasswordErrors((prev) => ({
              ...prev,
              general: error || "Failed to change password. Please try again.",
            }));
          }
        )
      );
    } catch (err) {
      setPasswordErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotificationError("");
    setNotificationSuccess("");

    try {
      await dispatch(
        updateNotificationSettings(
          notificationPrefs,
          () => {
            setNotificationSuccess("Notification preferences updated!");
            setTimeout(() => setNotificationSuccess(""), 5000);
          },
          (error: string) => {
            setNotificationError(
              error || "Failed to update notifications. Please try again."
            );
          }
        )
      );
    } catch (err) {
      setNotificationError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrivacyError("");
    setPrivacySuccess("");

    try {
      await dispatch(
        updatePrivacySettings(
          privacyPrefs,
          () => {
            setPrivacySuccess("Privacy settings updated!");
            setTimeout(() => setPrivacySuccess(""), 5000);
          },
          (error: string) => {
            setPrivacyError(
              error || "Failed to update privacy settings. Please try again."
            );
          }
        )
      );
    } catch (err) {
      setPrivacyError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-4 md:p-6"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Profile
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Account Preferences
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center p-3 rounded-lg ${
                activeTab === "security"
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <LockClosedIcon className="w-5 h-5 mr-3" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center p-3 rounded-lg ${
                activeTab === "notifications"
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <BellIcon className="w-5 h-5 mr-3" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center p-3 rounded-lg ${
                activeTab === "privacy"
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <ShieldCheckIcon className="w-5 h-5 mr-3" />
              Privacy
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <LockClosedIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Change Password
              </h2>

              {passwordErrors.general && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
                  <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{passwordErrors.general}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        passwordErrors.currentPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        passwordErrors.newPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        passwordErrors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <BellIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Notification Settings
              </h2>

              {notificationError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
                  <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{notificationError}</span>
                </div>
              )}

              {notificationSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{notificationSuccess}</span>
                </div>
              )}

              <form onSubmit={handleNotificationSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive updates via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="email"
                      checked={notificationPrefs.email}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      SMS Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive updates via text message
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="sms"
                      checked={notificationPrefs.sms}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Receive updates via app notifications
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="push"
                      checked={notificationPrefs.push}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-indigo-600" />
                Privacy Settings
              </h2>

              {privacyError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
                  <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{privacyError}</span>
                </div>
              )}

              {privacySuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{privacySuccess}</span>
                </div>
              )}

              <form onSubmit={handlePrivacySubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Profile Visibility
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="public"
                        checked={privacyPrefs.profileVisibility === "public"}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Public - Anyone can view my profile
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="friends"
                        checked={privacyPrefs.profileVisibility === "friends"}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Friends Only - Only my connections can view my profile
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value="private"
                        checked={privacyPrefs.profileVisibility === "private"}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Private - Only I can view my profile
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="dataSharing"
                      name="dataSharing"
                      type="checkbox"
                      checked={privacyPrefs.dataSharing}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="dataSharing"
                      className="font-medium text-gray-700"
                    >
                      Allow data sharing for analytics
                    </label>
                    <p className="text-gray-500">
                      Help us improve our services by sharing anonymous usage
                      data
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AccountPreferences;
