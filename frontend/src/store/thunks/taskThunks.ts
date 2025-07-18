import { createAsyncThunk } from "@reduxjs/toolkit";
import { ITask, TaskPriority } from "../../interfaces/Task";
import Api from "../../common/helpers/Api";
import { RootState } from "../reducers";

// Define the shape of the create task payload
interface CreateTaskPayload {
  title: string;
  description: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: TaskPriority;
  assigneeId?: string | null;
  creatorId: string;
}

export const createTask = createAsyncThunk<
  ITask,
  CreateTaskPayload,
  {
    state: RootState;
    rejectValue: string;
  }
>("tasks/create", async (taskData, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("No authentication token found");
    }

    const payload: CreateTaskPayload = {
      ...taskData,
      assigneeId: taskData.assigneeId || undefined,
    };

    const response = await Api.post("/tasks", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Directly return the task object
    return response.data as ITask;
  } catch (err: any) {
    console.error("Create task error:", err);
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to create task"
    );
  }
});
