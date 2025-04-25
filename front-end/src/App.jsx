import React from "react";
import './index.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import StudentAttendance from "./pages/StudentAttendance";
import AdminHome from "./pages/AdminHome";
import StudentDashboard from "./pages/StudentDashboard";
import AdminAttendence from "./pages/AdminAttendance";
import AdminDashboard from "./pages/AdminHome";
import Login from "./pages/Login";
import Signup from './pages/Signup';
import StudentNavBar from "./pages/StudentNavBar";
import AdminNavBar from "./pages/AdminNavBar";

function App() {
  // Simulating user role retrieval from local storage or session (admin or student)
  // const user = JSON.parse(localStorage.getItem("user"));
  // const userRole = user.role // 'admin' or 'student'

  return (
    <Router>
        {/* Conditionally Render NavBar based on user role */}
        {/* {userRole === "faculty" ? <AdminNavBar /> : <StudentNavBar />} */}

        
          <Routes>
            {/* Main Page - QR scanner */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/main" element={<MainPage />} />

            {/* Student Attendance Page */}
            <Route path="/student-attendance" element={<StudentAttendance/>} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />

            {/* Admin Home Page - Generate Session QR Code */}
            <Route path="/faculty-dashboard" element={<AdminDashboard />} />
            <Route path="/faculty-attendance" element={<AdminAttendence />} />
          </Routes>
    </Router>
  );
}

export default App;
