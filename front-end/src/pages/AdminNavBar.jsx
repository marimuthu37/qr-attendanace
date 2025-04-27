import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

function AdminNavBar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/faculty-dashboard" },
    { name: "Attendance", path: "/faculty-attendance" },
    { name: "Logout", path: "/login" },
  ];

  return (
    <nav className="bg-gradient-to-r from-cyan-400 to-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
    
          <div className="flex items-center space-x-4">
            <img
              src="/bitlogo.png"
              alt="Bannari Amman Institute of Technology Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-full"
            />
            <span className="text-white text-xl sm:text-3xl font-bold tracking-wide">
              FACULTY PANEL
            </span>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <ul className="hidden md:flex space-x-8">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`text-white text-lg font-medium py-2 px-5 rounded transition-all duration-300 ${
                    location.pathname === item.path
                     ? "bg-blue-50 text-red-400"
                      : "hover:bg-sky-100 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {isMenuOpen && (
          <ul className="flex flex-col md:hidden mt-3 space-y-2 pb-4">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-white text-base font-medium py-2 px-4 rounded transition-all duration-300 ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-900 shadow-md"
                      : "hover:bg-white hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

export default AdminNavBar;
