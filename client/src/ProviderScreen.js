// ProviderScreen.js
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";
import SpinnerComponent from "./components/UI/SpinnerComponent";

// Lazy-loaded provider pages
const ProvDashboard = React.lazy(() => import("./pages/ProviderPages/ProvDashboard"));
const ManageJobsPage = React.lazy(() => import("./pages/ProviderPages/ManageJobsPage"));
const ApplicantsPage = React.lazy(() => import("./pages/ProviderPages/ApplicantPage"));
const ManageApplicantPage = React.lazy(() => import("./pages/ProviderPages/ManageApplicantPage"));
const ViewShortlistedPage = React.lazy(() => import("./pages/ProviderPages/ViewShortlistedPage"));
const ReportPage = React.lazy(() => import("./pages/ProviderPages/ReportPage"));
const ChangePassword = React.lazy(() => import("./components/UI/ChangePassword"));

// Route configuration
const providerRoutes = [
  { path: "/dashboard", element: <ProvDashboard /> },
  { path: "/manage-jobs", element: <ManageJobsPage /> },
  { path: "/manage-applicants", element: <ApplicantsPage /> },
  { path: "/manage-applicants/:jobId", element: <ManageApplicantPage /> },
  { path: "/view-shortlists/:jobId", element: <ViewShortlistedPage /> },
  { path: "/provider-report", element: <ReportPage /> },
  { path: "/change-password", element: <ChangePassword /> },
];

export default function ProviderScreen() {
  return (
    <Layout>
      <Suspense fallback={<SpinnerComponent />}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />

          {/* Dynamically render all provider routes */}
          {providerRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </Suspense>
    </Layout>
  );
}
