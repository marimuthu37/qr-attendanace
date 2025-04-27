import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

function StudentNavBar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/student-dashboard" },
    { name: "Attendance", path: "/student-attendance" },
    { name: "Logout", path: "/" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gradient-to-r from-cyan-400 to-blue-600 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
    
          <div className="flex items-center space-x-4">
            <img
              src="/bitlogo.png"
              alt="Bannari Amman Institute of Technology Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-full"
            />
            <span className="text-white text-xl sm:text-3xl font-bold tracking-wide">
              STUDENT PANEL
            </span>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <ul className="hidden md:flex space-x-6">
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

        {isOpen && (
          <div className="md:hidden mt-4 bg-white rounded shadow-md">
            <ul className="flex flex-col">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`block px-6 py-3 text-base font-medium ${
                      location.pathname === item.path
                      
                        ? "bg-blue-100 text-red-500"
                        : "text-blue-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)} 
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default StudentNavBar;
