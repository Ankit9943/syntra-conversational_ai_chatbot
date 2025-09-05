import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PageNotFound from "../PageNotFound";

const MainRoutes = ({ theme, setTheme }) => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home theme={theme} setTheme={setTheme} />} />
        <Route
          path="/login"
          element={<Login theme={theme} setTheme={setTheme} />}
        />
        <Route
          path="/register"
          element={<Register theme={theme} setTheme={setTheme} />}
        />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default MainRoutes;
