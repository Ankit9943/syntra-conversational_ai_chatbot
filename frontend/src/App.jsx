import React, { useState, useEffect } from "react";
import MainRoutes from "./routes/MainRoutes";
import { FaSun, FaMoon } from "react-icons/fa";

const App = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="relative">
      {/* <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 text-2xl text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-white"
        >
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div> */}
      <MainRoutes theme={theme} setTheme={setTheme} />
    </div>
  );
};

export default App;
