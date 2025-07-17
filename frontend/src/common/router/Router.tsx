import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Layout from "../../../src/layouts/Layout";
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import ProfileWindow from "../../pages/auth/ProfileWindow";
import ChangePassword from "../../pages/auth/ChangePassword";
import AccountPreferences from "../../pages/auth/AccountPreferences";
import EditProfile from "../../pages/auth/EditProfile";
import UsersPage from "../../pages/auth/admin/UsersPage";
import EditUserPage from "../../pages/auth/admin/EditUserPage";

import TokenVerification from "../../pages/auth/TokenVerification";
import Details from "../../pages/tasks/Details";
import Task from "../../pages/tasks/Task";
import AddTaskPage from "../../pages/tasks/AddTaskPage";

interface RouterProps {
  openProfile: () => void;
}

const ProtectedRoute = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
};

const Router: React.FC<RouterProps> = ({ openProfile }) => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Task />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/verify-token" element={<TokenVerification />} />

        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<Task />} />
        <Route path="/tasks/:id" element={<Details />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings/password" element={<ChangePassword />} />
          <Route
            path="/profile"
            element={<ProfileWindow isOpen={true} onClose={() => {}} />}
          />
          <Route path="/admin/task/new" element={<AddTaskPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/users/edit/:userId" element={<EditUserPage />} />
        </Route>

        {/* Other routes */}
        <Route path="/account/preferences" element={<AccountPreferences />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
