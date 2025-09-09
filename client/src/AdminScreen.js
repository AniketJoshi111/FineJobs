// App.js (or AdminScreen.js)
import "./App.css";
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";
import SpinnerComponent from "./components/UI/SpinnerComponent";

// Lazy-loaded admin pages
const AdminDashboardPage = React.lazy(() => import("./pages/AdminPages/AdminDashboardPage"));
const ManageUsersPage = React.lazy(() => import("./pages/AdminPages/ManageUsersPage"));
const ManageJobsPage = React.lazy(() => import("./pages/AdminPages/ManageJobsPage"));
const ReportsPage = React.lazy(() => import("./pages/AdminPages/ReportsPage"));
const ChangePassword = React.lazy(() => import("./components/UI/ChangePassword"));
const PageNotFound = React.lazy(() => import("./pages/AdminPages/PageNotFound"));

// Route configuration object
const adminRoutes = [
  { path: "/dashboard", element: <AdminDashboardPage /> },
  { path: "/manage-users", element: <ManageUsersPage /> },
  { path: "/manage-jobs", element: <ManageJobsPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/change-password", element: <ChangePassword /> },
];

function AdminScreen() {
  return (
    <Layout>
      <Suspense fallback={<SpinnerComponent />}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />

          {/* Render all routes dynamically */}
          {adminRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Fallback for unknown routes */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default AdminScreen;
