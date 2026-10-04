import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetails from "./pages/ScholarshipDetails";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicationForm from "./pages/ApplicationForm";
import MyApplications from "./pages/MyApplications";
import ProviderApplications from "./pages/ProviderApplications";
import CreateScholarship from "./pages/CreateScholarship";
import MyScholarships from "./pages/MyScholarships";
import EditScholarship from "./pages/EditScholarship";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import StudentProfile from "./pages/StudentProfile";
import NotFound from "./pages/NotFound";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* ==========================================
            PUBLIC ROUTES
            ========================================== */}

        <Route path="/" element={<Home />} />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==========================================
            ALL LOGGED-IN USERS
            ========================================== */}

        <Route
          path="/scholarships"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
                "provider",
                "admin",
              ]}
            >
              <Scholarships />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scholarships/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
                "provider",
                "admin",
              ]}
            >
              <ScholarshipDetails />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            STUDENT ROUTES
            ========================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scholarships/:id/apply"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <ApplicationForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            ADMIN ROUTES
            ========================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            PROVIDER / ADMIN ROUTES
            ========================================== */}

        <Route
          path="/my-scholarships"
          element={
            <ProtectedRoute
              allowedRoles={[
                "provider",
                "admin",
              ]}
            >
              <MyScholarships />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-scholarship"
          element={
            <ProtectedRoute
              allowedRoles={[
                "provider",
                "admin",
              ]}
            >
              <CreateScholarship />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-scholarship/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "provider",
                "admin",
              ]}
            >
              <EditScholarship />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider-applications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "provider",
                "admin",
              ]}
            >
              <ProviderApplications />
            </ProtectedRoute>
          }
        />

        {/* ==========================================
            404 - UNKNOWN ROUTES
            Keep this route LAST
            ========================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;