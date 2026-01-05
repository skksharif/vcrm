import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import ClientProfile from "./pages/admin/ClientProfile";
import ClientsPage from "./pages/admin/Clients";
import UsersPage from "./pages/admin/Users";
import EmployeeTasks from "./pages/employee/Tasks";
import EmployeeTaskView from "./pages/employee/TaskView";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeDashboard from "./pages/employee/Dashboard";
import SMMDashboard from "./pages/smm/Dashboard";
import SMMTasks from "./pages/smm/Tasks";
import SMMTaskView from "./pages/smm/TaskView";
import SmmProfile from "./pages/smm/Profile";
import TeamLeadDashboard from "./pages/tl/DashboardNew";
import TeamLeadTasks from "./pages/tl/Tasks";
import TeamLeadTaskView from "./pages/tl/TaskView";
import TeamLeadGlobalCalendar from "./pages/tl/GlobalCalendar";
import TeamLeadCalendar from "./pages/tl/Calendar";
import TeamLeadProfile from "./pages/tl/TLProfile";
import TaskCalendarAssign from "./pages/tl/TaskCalendarAssign";
import WeekCalendarView from "./pages/tl/WeekCalendarView";
import EmployeeWorkload from "./pages/tl/EmployeeWorkload";
import AdminProfile from "./pages/admin/AdminProfile";
import GlobalCalendarPage from "./pages/admin/GlobalCalendar";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/admin/UserProfile";

export default function App() {
  const { loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  return (
    <Suspense>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <Dashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <ClientsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <ClientProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <UsersPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id/profile"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <UserProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <GlobalCalendarPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <RoleRoute role="CEO">
                <AdminProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <RoleRoute role="Employee">
                <EmployeeDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/tasks"
          element={
            <ProtectedRoute>
              <RoleRoute role="Employee">
                <EmployeeTasks />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/tasks/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="Employee">
                <EmployeeTaskView />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute>
              <RoleRoute role="Employee">
                <EmployeeProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/smm"
          element={
            <ProtectedRoute>
              <RoleRoute role="Social Media Manager">
                <SMMDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/smm/tasks"
          element={
            <ProtectedRoute>
              <RoleRoute role="Social Media Manager">
                <SMMTasks />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/smm/tasks/:id"
          element={
            <ProtectedRoute>
              <RoleRoute role="Social Media Manager">
                <SMMTaskView />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/smm/profile"
          element={
            <ProtectedRoute>
              <RoleRoute role="Social Media Manager">
                <SmmProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tl"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TeamLeadDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/tasks"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TeamLeadTasks />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/tasks/:id"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TeamLeadTaskView />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/calendar"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TeamLeadCalendar />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/global-calendar"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TeamLeadGlobalCalendar />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/profile"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TeamLeadProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/calendar-assign"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <TaskCalendarAssign />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/week-calendar"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <WeekCalendarView />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tl/employees"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["TL-1", "TL-2"]}>
                <EmployeeWorkload />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileRedirect />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function Home() {
  // redirect by role handled in AuthProvider via currentUser
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case "CEO":
      return <Navigate to="/admin" />;
    case "TL-1":
    case "TL-2":
      return <Navigate to="/tl" />;
    case "Employee":
      return <Navigate to="/employee" />;
    case "Social Media Manager":
      return <Navigate to="/smm" />;
    default:
      return <Navigate to="/login" />;
  }
}

function ProfileRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  if (user.role === "CEO") return <Navigate to="/admin/profile" />;
  if (user.role === "Employee") return <Navigate to="/employee/profile" />;
  if (user.role === "Social Media Manager") return <Navigate to="/smm/profile" />;
  if (user.role === "TL-1" || user.role === "TL-2") return <Navigate to="/tl/profile" />;

  return <Navigate to="/login" />;
}
