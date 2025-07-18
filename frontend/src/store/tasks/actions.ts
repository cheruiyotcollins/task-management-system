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
  assigneeId?: string | null;
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
        signal: taskRequest.signal,
      });

      const tasks = response.data; // Direct array of tasks

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
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

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

export const filterTasks =
  (filterParams: ITaskFilterParams, callback?: () => void) =>
  async (dispatch: AppDispatch) => {
    try {
      const queryParams = new URLSearchParams();

      if (filterParams.status) {
        queryParams.append("status", filterParams.status);
      }

      if (filterParams.priority) {
        queryParams.append("priority", filterParams.priority);
      }

      if (filterParams.assigneeId) {
        queryParams.append("assigneeId", filterParams.assigneeId);
      }

      if (filterParams.search) {
        queryParams.append("search", filterParams.search);
      }

      if (filterParams.q) {
        queryParams.append("q", filterParams.q);
      }

      const response = await Api.get(`/tasks?${queryParams.toString()}`);
      const tasks = response.data; // Direct array of filtered tasks

      dispatch({
        type: SET_FILTERED_TASKS,
        payload: tasks,
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

export const createTask =
  (taskData: NewTaskDto) => async (dispatch: AppDispatch) => {
    try {
      const response = await Api.post("/tasks", taskData);

      dispatch({
        type: ADD_TASK,
        payload: response.data, // Direct task object
      });

      toast.success("Task created successfully!");
      return { success: true, task: response.data };
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

export const getSingleTask =
  (taskId: string, onSuccess?: () => void) => async (dispatch: AppDispatch) => {
    try {
      const response = await Api.get(`/tasks/${taskId}`);

      dispatch({
        type: SET_SINGLE_TASK,
        payload: response.data, // Direct task object
      });

      onSuccess?.();
      return { success: true, task: response.data };
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

export const updateTask =
  (taskId: number, taskData: Partial<ITask>) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await Api.put(`/tasks/${taskId}`, taskData);

      dispatch({
        type: UPDATE_TASK,
        payload: response.data, // Direct task object
      });

      toast.success("Task updated successfully!");
      return { success: true, task: response.data };
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

export const updateTaskStatus =
  (taskId: string, newStatus: TaskStatus) => async (dispatch: AppDispatch) => {
    try {
      const response = await Api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      dispatch({
        type: UPDATE_TASK,
        payload: response.data, // Direct task object
      });

      toast.success("Task status updated!");
      return { success: true, task: response.data };
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
