// this is my global reducer:
import { combineReducers } from "redux";
import { AuthReducer } from "./auth";
import { TaskReducer } from "./tasks";

const reducers = combineReducers({
  auth: AuthReducer,
  tasks: TaskReducer,
});

export type RootState = ReturnType<typeof reducers>; // <--- This should correctly infer the type
export default reducers;
