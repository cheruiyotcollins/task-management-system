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
  assigneeId?: string;
  creatorId: string;
}

export const createTask = createAsyncThunk<
  ITask, // Return type of the payload creator
  CreateTaskPayload, // First argument to the payload creator
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

    const response = await Api.post("/tasks", taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "OK") {
      return response.data.payload as ITask;
    } else {
      return rejectWithValue(
        response.data.description || "Failed to create task"
      );
    }
  } catch (err: any) {
    console.error("Create task error:", err);
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to create task"
    );
  }
});
