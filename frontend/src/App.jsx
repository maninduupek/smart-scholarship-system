import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Scholarships from "./pages/Scholarships";
import ScholarshipDetails from "./pages/ScholarshipDetails";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicationForm from "./pages/ApplicationForm";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/scholarships" element={<Scholarships />} />

        <Route
          path="/scholarships/:id"
          element={<ScholarshipDetails />}
        />

        <Route
          path="/scholarships/:id/apply"
          element={<ApplicationForm />}
        />

        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;