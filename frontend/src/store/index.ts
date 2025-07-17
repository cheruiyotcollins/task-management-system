// index.ts
import { applyMiddleware, combineReducers, createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";

// Reducers
import authReducer from "./auth/reducer";
import taskReducer from "./tasks/reducer";

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
});

// Type of the root state
export type RootState = ReturnType<typeof rootReducer>;

// Persist config
const persistConfig = {
  key: "root",
  storage,
};

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

// Create store
const store = createStore(persistedReducer, applyMiddleware(thunk));
const persistor = persistStore(store);

// Export types
export type AppDispatch = typeof store.dispatch;

// Export store and persistor
export { store, persistor };
export default store;
