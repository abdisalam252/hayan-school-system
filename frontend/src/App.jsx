import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Students from "./pages/Students.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Teachers from "./pages/Teachers.jsx";
import Settings from "./pages/Settings.jsx";
import Classes from "./pages/Classes.jsx";
import Finance from "./pages/Finance.jsx";
import Attendance from "./pages/Attendance.jsx";

import Exams from "./pages/Exams.jsx";
import Library from "./pages/Library.jsx";
import Transport from "./pages/Transport.jsx";
import Events from "./pages/Events.jsx";
import Reports from "./pages/Reports.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import RecycleBin from "./pages/RecycleBin.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RequireAuth from "./components/RequireAuth.jsx";


import { SERVER_URL } from "./config";

function App() {
  // Simple check to ensure backend is searchable (optional dev helper)
  React.useEffect(() => {
    fetch(`${SERVER_URL}/`)
      .catch(err => console.log('Backend check silent fail (expected if auth required or offline)'));
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="classes" element={<Classes />} />
          <Route path="attendance" element={<Attendance />} />

          <Route path="events" element={<Events />} />
          <Route path="exams" element={<Exams />} />
          <Route path="library" element={<Library />} />
          <Route path="transport" element={<Transport />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="recycle-bin" element={<RecycleBin />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );

}

export default App;
// Force update timestamp: 2025-12-20