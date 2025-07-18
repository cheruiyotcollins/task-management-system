import {
  SET_TASKS,
  SET_FILTERED_TASKS,
  SET_SINGLE_TASK,
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  SET_ERROR,
} from "./type";
import { ITask } from "../../interfaces/Task";
interface IAction<T = any> {
  type: string;
  payload?: T;
  error?: boolean;
  meta?: any;
}

interface IPagination {
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

interface IPaginatedTasks {
  tasks: ITask[];
  pagination?: IPagination;
}

interface ITasksState {
  tasks: ITask[];
  filteredTasks: IPaginatedTasks;
  singleTask: ITask | null;
  loading: boolean;
  error: string | null;
}

const initialState: ITasksState = {
  tasks: [],
  filteredTasks: {
    tasks: [],
    pagination: undefined,
  },
  singleTask: null,
  loading: false,
  error: null,
};

const TasksReducer = (state = initialState, action: IAction): ITasksState => {
  switch (action.type) {
    case "TASKS_LOADING":
      return { ...state, loading: true, error: null };

    case SET_TASKS:
      return {
        ...state,
        tasks: action.payload as ITask[],
        loading: false,
      };

    case SET_FILTERED_TASKS: {
      const payload = action.payload;
      return {
        ...state,
        filteredTasks: {
          tasks: Array.isArray(payload) ? payload : payload?.tasks || [],
          pagination: Array.isArray(payload) ? undefined : payload?.pagination,
        },
        loading: false,
      };
    }

    case SET_SINGLE_TASK:
      return {
        ...state,
        singleTask: action.payload as ITask,
        loading: false,
      };

    case ADD_TASK:
      return {
        ...state,
        tasks: [action.payload as ITask, ...state.tasks],
        loading: false,
      };

    case UPDATE_TASK: {
      const updatedTask = action.payload as ITask;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
        singleTask:
          state.singleTask?.id === updatedTask.id
            ? updatedTask
            : state.singleTask,
        loading: false,
      };
    }

    case DELETE_TASK: {
      const taskId = action.payload as number; // Changed from string to number
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== taskId),
        singleTask: state.singleTask?.id === taskId ? null : state.singleTask,
        loading: false,
      };
    }

    case SET_ERROR:
      return {
        ...state,
        error: action.payload as string,
        loading: false,
      };

    default:
      return state;
  }
};

export default TasksReducer;
