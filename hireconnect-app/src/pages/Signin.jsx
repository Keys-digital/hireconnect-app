import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../layout/AuthLayout";
import { loginUser, loginWithGoogle } from "../api/authApi";

import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import OAuthLoginButtons from "../components/OAuthLoginButtons";
import "../styles/auth.css";

const Signin = () => {
  const navigate = useNavigate();
  const {
    setIsLoggedIn,
    getUserData,
    loginUser: loginUserWithContext,
  } = useContext(AppContext);

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call loginUser from AppContext, not directly from authApi
      const user = await loginUserWithContext(form); // this sets token + state

      // Then fetch profile data (optional if needed here)
      await getUserData?.();

      if (user?.role === "client") {
        navigate("/client/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleGoogleLogin = async (googleToken) => {
    try {
      const { user, accessToken } = await loginWithGoogle(googleToken);

      localStorage.setItem("token", accessToken);
      toast.success(`Welcome, ${user.name || user.email}`);

      setIsLoggedIn(true);
      await getUserData?.();

      if (user?.role === "client") {
        navigate("/client/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      toast.error("Google login failed");
      console.error(err);
    }
  };

  return (
    <AuthLayout backTo="/signup">
      <h1 className="auth-title">Sign in to your account</h1>

      {/* Reusable OAuth buttons */}
      <OAuthLoginButtons onGoogleLogin={handleGoogleLogin} />

      {/* Divider */}
      <div className="auth-divider">
        <span />
        <p>Or continue with</p>
        <span />
      </div>

      {/* Email/password login form */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="relative">
          <Mail className="auth-icon" />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="auth-input pl-10"
          />
        </div>

        <div className="relative">
          <Lock className="auth-icon" />
          <input
            type="password"
            name="password"
            required
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="auth-input pl-10"
          />
        </div>

        {/* Forgot password */}
        <div className="w-full text-right mb-2">
          <button
            type="button"
            onClick={() => navigate("/reset-password")}
            className="text-sm text-[#4d0892] hover:underline cursor-pointer bg-transparent"
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="auth-button">
          Sign in
        </button>
      </form>

      {/* Redirect to Sign Up */}
      <p className="auth-footer">
        Don’t have an account?{" "}
        <span onClick={() => navigate("/signup")}>Sign up</span>
      </p>
    </AuthLayout>
  );
};

export default Signin;
