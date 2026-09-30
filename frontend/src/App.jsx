import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
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

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/scholarships"
          element={<Scholarships />}
        />

        <Route
          path="/scholarships/:id"
          element={<ScholarshipDetails />}
        />

        <Route
          path="/scholarships/:id/apply"
          element={<ApplicationForm />}
        />

        <Route
          path="/my-applications"
          element={<MyApplications />}
        />

        <Route
          path="/my-scholarships"
          element={<MyScholarships />}
        />

        <Route
          path="/create-scholarship"
          element={<CreateScholarship />}
        />

        <Route
          path="/edit-scholarship/:id"
          element={<EditScholarship />}
        />

        <Route
          path="/provider-applications"
          element={<ProviderApplications />}
        />

        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;