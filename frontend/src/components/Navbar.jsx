import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Cookies from "js-cookie";
import { FiSun, FiUserMinus } from "react-icons/fi";
import { BsFillMoonStarsFill } from "react-icons/bs";
import logo from "../assets/syntra.png";

const Navbar = ({ toggleSidebar, theme, setTheme }) => {
  const navigate = useNavigate();

  // State to hold the login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for the cookie when the component mounts.
    // Ensure you use the SAME name as where you set it (e.g., 'token').
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
  }, []); // The empty array [] means this effect runs only once on mount.

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav
      className=" flex items-center justify-between px-3 md:px-6 py-4 
        bg-[#181818] dark:bg-[#181818]/30 backdrop-blur-lg
        shadow-md border border-white/20 dark:border-gray-700/30
        sticky top-0 z-20 rounded-2xl mx-2 mt-4 transition-colors duration-500"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="z-20 p-2 text-gray-700 rounded-lg hover:bg-white/40 
            dark:text-gray-200 dark:hover:bg-gray-700/40 transition"
        >
          <FaBars size={20} />
        </button>

        <Link
          to="/"
          className="absolute top-1/2 -translate-y-1/2 md:left-8 z-10"
        >
          <img
            src={logo}
            alt="Syntra"
            draggable={false}
            className="md:h-29 h-22 w-auto" // <-- Make the logo bigger here!
          />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600
                hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl font-medium hidden md:block
                text-white bg-gradient-to-r from-indigo-500 to-purple-600
                hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout} // Make sure to connect the handler!
            className="px-4 py-2 rounded-xl text-white bg-red-600 transition"
          >
            Logout
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/40 dark:bg-gray-700/40
            hover:scale-110 transition flex items-center justify-center"
        >
          {theme === "light" ? (
            <BsFillMoonStarsFill size={25} />
          ) : (
            <FiSun className="text-white" size={20} />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
