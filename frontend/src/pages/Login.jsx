import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // form submit handler
  const onSubmit = async (data) => {
    // console.log("Form Data:", data);
    try {
      const res = await axios.post(
        "https://syntra-conversational-ai-chatbot.onrender.com/api/auth/login",
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true,
        }
      );
      // console.log("Response:", res.data);
      navigate("/");
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to log in");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login
        </h1>

        {/* react-hook-form handles validation */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border 
                       border-transparent rounded-md shadow-sm hover:bg-indigo-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
