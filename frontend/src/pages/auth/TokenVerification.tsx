import React, { useState } from "react";
import { useAppDispatch } from "../../store/hook";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../../common/components/Loader";
import { motion } from "framer-motion";
import { EnvelopeIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { verifyToken } from "../../store/auth/actions";

const TokenVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  // Get email from location state (passed from registration)
  const email = location.state?.email || "";

  const handleOnSuccess = () => {
    setLoading(false);
    navigate("/login", {
      state: { message: "Account verified successfully! Please log in." },
    });
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    setError("");
  };

  const handleTokenVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Please enter the verification token");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        verifyToken({ email, token }, handleOnSuccess, (error) => {
          setLoading(false);
          if (error.response?.status === 400) {
            setError(
              error.response.data?.message ||
                "Invalid token. Please check and try again."
            );
          } else if (error.response?.status === 401) {
            setError(
              error.response.data?.message ||
                "Token expired. Please request a new one."
            );
          } else if (error.message) {
            setError(error.message);
          } else {
            setError("An error occurred. Please try again later.");
          }
        })
      );
    } catch (error: any) {
      setLoading(false);
      setError(error.message || "Unexpected error occurred. Please try again.");
      console.error("Token verification error:", error);
    }
  };

  const handleResendToken = async () => {
    setLoading(true);
    // You would need to implement a resendToken action in your store
    // similar to the verifyToken action
    try {
      // await dispatch(resendToken({ email }, () => {
      //   setLoading(false);
      //   setError(""); // or show success message
      // }, (error) => {
      //   setLoading(false);
      //   setError(error.message || "Failed to resend token. Please try again.");
      // }));
    } catch (error) {
      setLoading(false);
      setError("Failed to resend token. Please try again.");
    }
  };

  return (
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
            <EnvelopeIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-400">
            We've sent a verification token to {email || "your email"}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm flex items-center"
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
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleTokenVerification}>
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Verification Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="Enter 6-digit token"
                  required
                  value={token}
                  onChange={handleTokenChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                loading ? "bg-indigo-800 opacity-70 cursor-not-allowed" : ""
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify Account
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
            Didn't receive a token?{" "}
            <button
              onClick={handleResendToken}
              disabled={loading}
              className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Token
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TokenVerification;
