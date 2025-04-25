import React from "react";
import { Link, useLocation } from "react-router-dom";

function AdminNavBar() {
  const location = useLocation();

  const navItems = [
    { name: "DASHBOARD", path: "/faculty-dashboard" },
    { name: "ATTENDANCE", path: "/faculty-attendance" },
    { name: "LOGOUT", path: "/login" },
  ];

  return (
    <nav className="bg-[#2FB8CC] py-6  shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-end">
        <div className="text-white text-2xl font-semibold ">
          FACULTY PANEL
        </div>
        <ul className="hidden md:flex space-x-20">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`text-white text-lg font-medium transition-all duration-300 ease-in-out py-2 px-3 rounded-md ${
                  location.pathname === item.path
                    ? "border-2 border-blue-400 text-blue-300"
                    : "hover:text-blue-300"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default AdminNavBar;
