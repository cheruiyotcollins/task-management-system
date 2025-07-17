import React, { useState } from "react";
import { useAppDispatch } from "../../store/hook";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../../common/components/Loader";
import { attemptSignup } from "../../store/auth/actions";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const initialUserDetails = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    contact: "",
  };

  const [userDetails, setUserDetails] = useState(initialUserDetails);
  const [formErrors, setFormErrors] = useState<string>("");
  const [passwordMatchError, setPasswordMatchError] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleOnSuccess = () => {
    setLoading(false); // Set loading to false on success before navigating
    navigate("/verify-token");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormErrors("");
    setPasswordMatchError("");
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormErrors("");
    setPasswordMatchError("");

    if (userDetails.password !== userDetails.confirmPassword) {
      setPasswordMatchError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Create FormData to send both JSON data and file
      const formData = new FormData();

      // Append user details as a JSON string to a Blob
      const userJson = new Blob(
        [
          JSON.stringify({
            fullName: userDetails.fullName,
            email: userDetails.email,
            password: userDetails.password,
            gender: userDetails.gender,
            contact: userDetails.contact,
          }),
        ],
        {
          type: "application/json",
        }
      );
      formData.append("user", userJson); // Use a single 'user' field for JSON data

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await dispatch(
        // Use await here
        attemptSignup(formData, handleOnSuccess, (error) => {
          setLoading(false);

          if (error.response?.status === 400) {
            setFormErrors(
              error.response.data?.message ||
                "Invalid input. Please check your details."
            );
          } else if (error.response?.status === 401) {
            setFormErrors(
              error.response.data?.message || "Unauthorized. Please try again."
            );
          } else if (error.message) {
            // Fallback for network errors or other client-side errors
            setFormErrors(error.message);
          } else {
            setFormErrors("An error occurred. Please try again later.");
          }
        })
      );
    } catch (error: any) {
      // Catch block for dispatch promise rejection
      setLoading(false);
      setFormErrors(
        error.message || "Unexpected error occurred. Please try again."
      );
      console.error("Signup error:", error);
    }
  };

  return (
    // Main container for the entire page with dark background
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {loading && <Loader />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4"
          >
            <UserIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">
            Signup to enjoy our exclusive deals!!!
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700" // Dark background for the form card
        >
          {(formErrors || passwordMatchError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm flex items-center" // Darker error styling
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formErrors || passwordMatchError}
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-1" // Dark mode label
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  required
                  value={userDetails.fullName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" // Dark mode input
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1" // Dark mode label
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  required
                  value={userDetails.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" // Dark mode input
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1" // Dark mode label
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={userDetails.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" // Dark mode input
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1" // Dark mode label
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={userDetails.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" // Dark mode input
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-300 mb-1" // Dark mode label
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0712345678"
                  required
                  value={userDetails.contact}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" // Dark mode input
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-300 mb-1" // Dark mode label
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={userDetails.gender}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200" // Dark mode select
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {" "}
                {/* Dark mode label */}
                Profile Picture (optional)
              </label>
              <div className="flex items-center space-x-4">
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile Preview"
                    className="h-16 w-16 rounded-full object-cover border border-gray-600 shadow-md" // Dark mode border
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 border border-gray-600">
                    {" "}
                    {/* Dark mode placeholder */}
                    <UserIcon className="h-6 w-6" />
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    capture="user" // prompts camera on mobile
                    className="text-sm text-gray-400 bg-gray-700 rounded-lg p-2 border border-gray-600 hover:bg-gray-600 transition duration-200 cursor-pointer" // Dark mode file input styling
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                loading ? "bg-indigo-800 opacity-70 cursor-not-allowed" : "" // Darker and more explicit disabled state
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Sign Up
                  <motion.span
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="ml-2"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {" "}
            {/* Dark mode text */}
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors duration-200" // Dark mode link hover
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
