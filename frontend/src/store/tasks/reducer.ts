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

interface ITasksState {
  tasks: ITask[];
  filteredTasks:
    | ITask[]
    | {
        tasks: ITask[];
        pagination?: {
          totalPages: number;
          totalElements: number;
          currentPage: number;
          pageSize: number;
        };
      };
  singleTask: ITask | null;
  loading: boolean;
  error: string;
}

// Initial state
const initialState: ITasksState = {
  tasks: [],
  filteredTasks: {
    tasks: [],
    pagination: undefined,
  },
  singleTask: null,
  loading: false,
  error: "",
};

// Generic action interface
interface IAction<T = any> {
  type: string;
  payload?: T;
}

// Reducer
const TasksReducer = (state = initialState, action: IAction): ITasksState => {
  switch (action.type) {
    case SET_TASKS:
      return {
        ...state,
        tasks: action.payload as ITask[],
      };

    case SET_SINGLE_TASK:
      return {
        ...state,
        singleTask: action.payload as ITask,
      };

    case SET_FILTERED_TASKS:
      const filteredTasks = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.tasks || [];

      return {
        ...state,
        filteredTasks: {
          tasks: filteredTasks,
          pagination: Array.isArray(action.payload)
            ? undefined
            : action.payload?.pagination,
        },
      };

    case ADD_TASK:
      return {
        ...state,
        tasks: [action.payload as ITask, ...state.tasks],
      };

    case UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === (action.payload as ITask).id ? action.payload : task
        ),
        singleTask:
          state.singleTask?.id === (action.payload as ITask).id
            ? action.payload
            : state.singleTask,
      };

    case DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(
          (task) => task.id !== (action.payload as string)
        ),
        singleTask:
          state.singleTask?.id === action.payload ? null : state.singleTask,
      };

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
