import {
  SET_AUTH,
  SET_CURRENT_USER,
  SET_IS_LOGGED_IN,
  LOGOUT,
  LOGIN_SUCCESS,
  SET_ALL_USERS,
  SET_USERS_LOADING,
  SET_USERS_ERROR,
} from "./type";
import { IUser } from "../../interfaces/Auth";

interface UsersState {
  users: IUser[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

// Helper to get current user
const getInitialUserState = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse user data", error);
    return null;
  }
};

const initialState = {
  isLoggedIn: !!localStorage.getItem("token"),
  currentUser: getInitialUserState(),
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"), // 🔥 Include refresh token
  users: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  pageSize: 10,
  loading: false,
  error: null,
};

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USERS_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SET_ALL_USERS:
      return {
        ...state,
        users: action.payload.users,
        totalPages: action.payload.totalPages,
        totalElements: action.payload.totalElements,
        currentPage: action.payload.currentPage,
        pageSize: action.payload.pageSize,
        loading: false,
        error: null,
      };

    case SET_USERS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken, // ✅ Save refreshToken
      };

    case SET_AUTH:
      return {
        ...state,
        ...action.payload,
      };

    case SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload,
      };

    case SET_IS_LOGGED_IN:
      return {
        ...state,
        isLoggedIn: action.payload,
      };

    case LOGOUT:
      return {
        isLoggedIn: false,
        currentUser: null,
        token: null,
        refreshToken: null, // ❌ Clear refreshToken on logout
      };

    case "USER_DELETED_SUCCESS":
      return {
        ...state,
        totalElements: state.totalElements > 0 ? state.totalElements - 1 : 0,
        loading: false,
        error: null,
      };

    case "SET_CURRENT_PAGE":
      return {
        ...state,
        currentPage: action.payload,
      };

    default:
      return state;
  }
};

export default AuthReducer;
