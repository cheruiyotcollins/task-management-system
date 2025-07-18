import {
  SET_TASKS,
  SET_FILTERED_TASKS,
  SET_SINGLE_TASK,
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  SET_ERROR,
} from "./type";
import Api from "../../common/helpers/Api";
import { toast } from "react-toastify";
import { AppDispatch } from "../index";
import { AxiosError } from "axios";
import {
  ITask,
  ITaskFilterParams,
  NewTaskDto,
  TaskStatus,
} from "../../interfaces/Task";

export interface TaskRequest {
  status?: TaskStatus | null;
  assigneeId?: number | null;
}

export const getTasks =
  (
    taskRequest: TaskRequest & { signal?: AbortSignal } = {},
    onSuccess?: () => void
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const token = localStorage.getItem("token");

      const response = await Api.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: taskRequest.status ?? undefined,
          assigneeId: taskRequest.assigneeId ?? undefined,
        },
        signal: taskRequest.signal, // Pass the abort signal to axios
      });

      const tasks = response.data.payload;

      dispatch({
        type: SET_TASKS,
        payload: tasks,
      });

      dispatch({
        type: SET_FILTERED_TASKS,
        payload: tasks,
      });

      onSuccess?.();
      return { success: true };
    } catch (error) {
      // Check if the error was caused by an abort
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      // Ignore abort errors
      if (axiosError.code === "ERR_CANCELED") {
        return { success: false, aborted: true };
      }

      console.error("Error fetching tasks:", error);

      dispatch({
        type: SET_ERROR,
        payload:
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to get tasks",
      });

      toast.error("Failed to fetch tasks");

      return {
        success: false,
        error: axiosError.response?.data?.message || "Failed to fetch tasks",
      };
    }
  };
/**
 * Filter tasks based on parameters
 * @param filterParams - Filter criteria
 * @param callback - Optional callback
 */
export const filterTasks =
  (
    filterParams: ITaskFilterParams & {
      page?: number;
      size?: number;
    },
    callback?: () => void
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const queryParams = new URLSearchParams();

      // Status filtering
      if (filterParams.status) {
        queryParams.append("status", filterParams.status);
      }

      // Priority filtering
      if (filterParams.priority) {
        queryParams.append("priority", filterParams.priority);
      }

      // Assignee filtering
      if (filterParams.assigneeId) {
        queryParams.append("assigneeId", filterParams.assigneeId);
      }

      // Search term
      if (filterParams.search) {
        queryParams.append("search", filterParams.search);
      }

      // Pagination
      if (filterParams.page) {
        queryParams.append("page", filterParams.page.toString());
      }

      if (filterParams.size) {
        queryParams.append("size", filterParams.size.toString());
      }

      const response = await Api.get(`/tasks?${queryParams.toString()}`);
      const responseData = response.data;

      dispatch({
        type: SET_FILTERED_TASKS,
        payload: {
          tasks: responseData.payload,
          pagination: {
            totalPages: responseData.totalPages,
            totalElements: responseData.totalElements,
            currentPage: responseData.currentPage,
            pageSize: responseData.pageSize,
          },
        },
      });

      callback?.();
    } catch (error) {
      console.error("Error filtering tasks:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      dispatch({
        type: SET_ERROR,
        payload:
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to filter tasks",
      });
    }
  };

/**
 * Create a new task
 * @param taskData - Task data to create
 */
export const createTask =
  (taskData: NewTaskDto) => async (dispatch: AppDispatch) => {
    try {
      const response = await Api.post("/tasks", taskData);

      dispatch({
        type: ADD_TASK,
        payload: response.data.payload, // this should be a full ITask object
      });

      toast.success("Task created successfully!");
      return { success: true, task: response.data.payload };
    } catch (error) {
      console.error("Error creating task:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      toast.error(
        axiosError.response?.data?.message || "Failed to create task"
      );
      return {
        success: false,
        error: axiosError.response?.data?.message || "Failed to create task",
      };
    }
  };

/**
 * Get single task by ID
 * @param taskId - ID of the task to fetch
 * @param onSuccess - Optional success callback
 */
export const getSingleTask =
  (taskId: string, onSuccess?: () => void) => async (dispatch: AppDispatch) => {
    try {
      const response = await Api.get(`/tasks/${taskId}`);

      dispatch({
        type: SET_SINGLE_TASK,
        payload: response.data.payload,
      });

      onSuccess?.();
      return { success: true, task: response.data.payload };
    } catch (error) {
      console.error("Error fetching task:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      toast.error(axiosError.response?.data?.message || "Failed to fetch task");
      return {
        success: false,
        error: axiosError.response?.data?.message || "Failed to fetch task",
      };
    }
  };

/**
 * Update an existing task
 * @param taskId - ID of the task to update
 * @param taskData - Updated task data
 */
export const updateTask =
  (taskId: number, taskData: Partial<ITask>) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await Api.put(`/tasks/${taskId}`, taskData);

      dispatch({
        type: UPDATE_TASK,
        payload: response.data.payload,
      });

      toast.success("Task updated successfully!");
      return { success: true, task: response.data.payload };
    } catch (error) {
      console.error("Error updating task:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      toast.error(
        axiosError.response?.data?.message || "Failed to update task"
      );
      return {
        success: false,
        error: axiosError.response?.data?.message || "Failed to update task",
      };
    }
  };

/**
 * Delete a task
 * @param taskId - ID of the task to delete
 */
export const deleteTask = (taskId: string) => async (dispatch: AppDispatch) => {
  try {
    await Api.delete(`/tasks/${taskId}`);

    dispatch({
      type: DELETE_TASK,
      payload: taskId,
    });

    toast.success("Task deleted successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    toast.error(axiosError.response?.data?.message || "Failed to delete task");
    return {
      success: false,
      error: axiosError.response?.data?.message || "Failed to delete task",
    };
  }
};

/**
 * Update task status
 * @param taskId - ID of the task to update
 * @param newStatus - New status (TODO, IN_PROGRESS, DONE)
 */
export const updateTaskStatus =
  (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await Api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      dispatch({
        type: UPDATE_TASK,
        payload: response.data.payload,
      });

      toast.success("Task status updated!");
      return { success: true, task: response.data.payload };
    } catch (error) {
      console.error("Error updating task status:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      toast.error(
        axiosError.response?.data?.message || "Failed to update task status"
      );
      return {
        success: false,
        error:
          axiosError.response?.data?.message || "Failed to update task status",
      };
    }
  };
