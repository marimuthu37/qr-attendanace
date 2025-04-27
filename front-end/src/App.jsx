import React from "react";
import './index.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StudentAttendance from "./pages/StudentAttendance";
import AdminHome from "./pages/AdminHome";
import AdminAttendence from "./pages/AdminAttendance";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />

            <Route path="/student-attendance" element={<StudentAttendance/>} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />

            <Route path="/faculty-dashboard" element={<AdminHome />} />
            <Route path="/faculty-attendance" element={<AdminAttendence />} />
          </Routes>
    </Router>
  );
}

export default App;
