// src/context/AppContext.jsx
import { createContext, useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser as loginUserApi } from "../api/authApi";
import { logoutUser as logoutApi } from "../api/authApi";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Minimal auth check (calls /api/auth/is-auth)
  const getAuthState = async () => {
    try {
      const { data } = await apiClient.get("/api/auth/is-auth");

      if (data.success) {
        setIsLoggedIn(true);
        setUserData(data.userData);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  //  Full profile fetch (calls /api/profile/data) — use in pages only
  const getUserData = async () => {
    try {
      const { data } = await apiClient.get("/api/profile/data");

      if (data.success) {
        setUserData(data.profile);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const loginUser = async (formData) => {
    try {
      const data = await loginUserApi(formData);

      if (!data || !data.user) {
        throw new Error("Invalid response from server");
      }

      const user = data.user;

      setIsLoggedIn(true);
      setUserData(user);
      localStorage.setItem("token", user.token);

      toast.success(`Welcome, ${user.email}`);
      return user;
    } catch (error) {
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logoutApi();
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem("token"); // optional
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Only check basic auth on app load — fast
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getAuthState();
    } else {
      setLoading(false); // Avoid infinite spinner when not logged in
    }
  }, []);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
    logoutUser,
    loginUser,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </AppContext.Provider>
  );
};
