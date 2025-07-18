import {
  LOGOUT,
  SET_AUTH,
  SET_IS_LOGGED_IN,
  SET_ALL_USERS,
  SET_USERS_LOADING,
  SET_USERS_ERROR,
  USER_DELETED_SUCCESS,
} from "./type";
import Api from "../../common/helpers/Api";
import { IPaginatedUsersResponse, IUser } from "../../interfaces/Auth";
import { AppDispatch } from "..";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";

export const setAuth = (data) => {
  return {
    type: SET_AUTH,
    payload: data,
  };
};

export const setIsLoggedIn = (data) => {
  return {
    type: SET_IS_LOGGED_IN,
    payload: data,
  };
};

export const checkIfUserIsLoggedIn = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    dispatch(setIsLoggedIn(true));
  } else {
    dispatch(setIsLoggedIn(false));
  }
};
export interface CustomApiError {
  message: string;
  status?: number;
}

export const fetchCurrentUser =
  (onSuccess: (data: any) => void, onError: (err: CustomApiError) => void) =>
  async (dispatch: AppDispatch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      onError({ message: "No authentication token found.", status: 401 });
      return;
    }

    try {
      const response = await Api.get("/auth/current", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { status, payload } = response.data;

      if (status === "OK" && payload) {
        onSuccess(payload);
      } else {
        const message = "Unexpected response format or user not found.";
        toast.error(message);
        onError({ message, status: response.status });
      }
    } catch (error) {
      let errorMessage = "Failed to fetch user information.";
      let errorStatus: number | undefined;

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          errorMessage;
        errorStatus = error.response?.status;

        if (errorStatus === 401) {
          dispatch(logOut());

          onError({ message: "Session expired.", status: 401 });

          return; // Stop execution after handling 401
        }
      }

      dispatch({ type: SET_USERS_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      onError({ message: errorMessage, status: errorStatus }); // Pass the error message and status
      // return { success: false, error: errorMessage };
    }
  };

export const attemptLogin =
  (credentials, onSuccess, onError) => async (dispatch) => {
    try {
      const response = await Api.postNoToken("/auth/login", credentials);

      const { accessToken, currentUser } = response.data;

      if (!accessToken || !currentUser) {
        throw new Error("Authentication failed: Incomplete token/user data");
      }

      const user = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        gender: currentUser.gender,
        contact: currentUser.contact,
        profileImagePath: currentUser.profileImagePath || "default-image-url",
      };

      // Persist auth info in localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch auth state update
      dispatch(
        setAuth({
          isLoggedIn: true,
          currentUser: user,
          token: accessToken,
        })
      );

      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (err) {
      console.error("Login Error:", err);

      // Clear stored auth info
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Reset auth state
      dispatch(
        setAuth({
          isLoggedIn: false,
          currentUser: null,
          token: null,
        })
      );

      onError(err);
    }
  };

export const attemptRefreshtoken =
  (refreshToken: string, onSuccess: () => void, onError: (err: any) => void) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await Api.postNoToken("/users/auth/refresh", {
        refreshToken,
      });

      const {
        accessToken,
        refreshToken: newRefreshToken,
        currentUser,
      } = response.data;

      if (!accessToken || !newRefreshToken || !currentUser) {
        throw new Error("Refresh failed: Incomplete response");
      }

      const user = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        gender: currentUser.gender,
        contact: currentUser.contact,
        profileImagePath: currentUser.profileImagePath || "default-image-url",
      };

      // Update local storage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Update Redux store
      dispatch(
        setAuth({
          isLoggedIn: true,
          currentUser: user,
          token: accessToken,
          refreshToken: newRefreshToken,
        })
      );

      onSuccess();
    } catch (err) {
      console.error("Refresh token error:", err);

      // Clean up on failure
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      dispatch(
        setAuth({
          isLoggedIn: false,
          currentUser: null,
          token: null,
          refreshToken: null,
        })
      );

      onError(err);
    }
  };

export const initializeAuth = () => (dispatch) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (token && userString) {
    try {
      const user = JSON.parse(userString);
      dispatch(
        setAuth({
          isLoggedIn: true,
          currentUser: user,
          token: token,
        })
      );
    } catch (e) {
      // Clear invalid auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
};
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
export const attemptSignup =
  (userDetails, onSuccess, onError) => async (dispatch) => {
    try {
      const isFormData = userDetails instanceof FormData;

      const response = await Api.postNoToken(
        "/users/auth/signup",
        userDetails,
        {
          headers: isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
        }
      );

      onSuccess();
    } catch (err) {
      onError(err);
    }
  };

export const fetchUserByEmail =
  (
    userId: string,
    onSuccess: (user: any) => void,
    onError: (err: any) => void
  ) =>
  async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated!");
      return;
    }

    try {
      const response = await Api.get(`/users/auth/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, payload } = response.data;
      if (status === "OK" && payload) {
        onSuccess(payload);
        console.log(payload);
      } else {
        onError(new Error("User not found or unexpected format"));
      }
    } catch (err) {
      onError(err);
    }
  };

export const logOut = (onSuccess?: () => void) => (dispatch: AppDispatch) => {
  //todo
  localStorage.clear();
  sessionStorage.clear();

  dispatch(setAuth({ isLoggedIn: false, currentUser: null, token: null }));
  dispatch({ type: LOGOUT });
  onSuccess?.();
};

export const changePassword =
  ({ currentPassword, newPassword }, onSuccess, onError) =>
  async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return onError("You are not authenticated.");
    }

    try {
      const response = await Api.put(
        "/users/auth/update-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status === "OK") {
        onSuccess();
      } else {
        onError(response.data?.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Password Change Error:", err);
      const errorMessage = "Something went wrong while changing password.";
      onError(errorMessage);
    }
  };
// api/user.ts

export const updateNotificationSettings =
  (data, onSuccess, onError) => async () => {
    const token = localStorage.getItem("token");
    if (!token) return onError("You are not authenticated.");

    try {
      const response = await Api.put("/users/notifications/preferences", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.status === "OK") {
        onSuccess();
      } else {
        onError(
          response.data?.message || "Failed to update notification preferences."
        );
      }
    } catch (err) {
      console.error("Notification Update Error:", err);
      onError("Something went wrong while updating notification preferences.");
    }
  };
export const updatePrivacySettings = (data, onSuccess, onError) => async () => {
  const token = localStorage.getItem("token");
  if (!token) return onError("You are not authenticated.");

  try {
    const response = await Api.put("/users/privacy/preferences", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data?.status === "OK") {
      onSuccess();
    } else {
      onError(response.data?.message || "Failed to update privacy settings.");
    }
  } catch (err) {
    console.error("Privacy Update Error:", err);
    onError("Something went wrong while updating privacy settings.");
  }
};

export const attemptUpdateProfile =
  (updatedUserData, onSuccess, onError) => async (dispatch) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("email");

    if (!token || !userId) {
      alert("User is not authenticated or missing ID!");
      return;
    }

    try {
      const response = await Api.put(`/users/auth/${userId}`, updatedUserData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, payload } = response.data;

      if (status === "OK" && payload) {
        onSuccess(payload); // profile update successful
      } else {
        onError(new Error("Unexpected response format or update failed."));
      }
    } catch (err) {
      onError(err);
    }
  };

export const fetchAllUsers =
  ({ signal }: { signal?: AbortSignal } = {}) =>
  async (dispatch: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({ type: SET_USERS_ERROR, payload: "Authentication required." });
      return { success: false, error: "Authentication required" };
    }

    dispatch({ type: SET_USERS_LOADING });

    try {
      const response = await Api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal, // Add the abort signal to the request
      });

      // Check if the request was aborted
      if (signal?.aborted) {
        return { success: false, aborted: true };
      }

      const { status, payload } = response.data;

      if (status === "OK" && payload) {
        dispatch({
          type: SET_ALL_USERS,
          payload: {
            users: payload,
          },
        });
        return { success: true };
      } else {
        const errorMsg = response.data.description || "Failed to fetch users.";
        dispatch({
          type: SET_USERS_ERROR,
          payload: errorMsg,
        });
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      // Ignore abort errors
    }
  };

export const deleteUser = (userId: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: SET_USERS_LOADING });
  try {
    // Replace with your actual API call to delete a user
    await Api.delete(`/users/auth/${userId}`); // Adjust endpoint as per your backend

    dispatch({
      type: USER_DELETED_SUCCESS,
      payload: userId, // Optionally send the ID of the deleted user
    });
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete user.";
    dispatch({
      type: SET_USERS_ERROR, // Or a specific DELETE_USER_ERROR
      payload: errorMessage,
    });
  }
};
export const setCurrentPage = (page: number) => ({
  type: "SET_CURRENT_PAGE",
  payload: page,
});
export const fetchRoles = (
  onSuccess: (roles: any[]) => void,
  onError: () => void
) => {
  return async (dispatch: any) => {
    try {
      const res = await Api.get("/users/auth/roles");
      if (res.data?.payload) {
        onSuccess(res.data.payload);
      } else {
        throw new Error("Invalid roles response");
      }
    } catch (error) {
      console.error("Error fetching roles", error);
      onError();
    }
  };
};
export const verifyToken = (
  payload: { email: string; token: string },
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await Api.post("/auth/verify-token", payload);
      // Handle successful verification
      dispatch({ type: "VERIFY_TOKEN_SUCCESS", payload: response.data });
      onSuccess();
    } catch (error) {
      dispatch({ type: "VERIFY_TOKEN_FAILURE", error });
      onError(error);
    }
  };
};
export const resendToken = (
  payload: { email: string },
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  return async (dispatch: AppDispatch) => {
    try {
      await Api.post("/auth/resend-token", payload);
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };
};
