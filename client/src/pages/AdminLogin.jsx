import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";

import { useLoginAdminMutation } from "../redux/api/adminApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await loginAdmin(formData).unwrap();

      dispatch(
        setCredentials({
          token: response.token,
          admin: response.admin,
        })
      );

      navigate("/admin/dashboard");
    } catch (error) {
      setError(
        error?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#232466] flex items-center justify-center mb-5">
              <LockKeyhole className="text-white" size={24} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Login
            </h1>

            <p className="mt-2 text-gray-500">
              Login to manage your ZoomLite meetings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-[#232466]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-[#232466]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#232466] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;