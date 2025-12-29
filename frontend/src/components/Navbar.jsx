import React from "react";
import { Link, NavLink } from "react-router-dom";
import { GraduationCap, LogIn, Users } from "lucide-react";

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
      ? "bg-indigo-600 text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
    }`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <GraduationCap className="w-8 h-8" />
            <span>Hayan School</span>
          </Link>

          <div className="flex gap-4">
            <NavLink to="/students" className={linkClass}>
              <Users className="w-5 h-5" />
              <span>Students</span>
            </NavLink>
            <NavLink to="/login" className={linkClass}>
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;