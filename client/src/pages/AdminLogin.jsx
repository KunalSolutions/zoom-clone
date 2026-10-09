import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LockKeyhole,
  Mail,
  ArrowRight,
  Video,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#232466]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#EF5622]/[0.06] blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 transition hover:text-[#232466]"
        >
          <ArrowLeft size={17} />
          Back to workspace
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
          <div className="h-1.5 bg-gradient-to-r from-[#232466] via-[#4445a0] to-[#EF5622]" />

          <div className="p-6 sm:p-9">
            <div className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#232466] shadow-lg shadow-[#232466]/20">
                <Video size={27} className="text-white" strokeWidth={1.8} />
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#232466]/10 bg-[#232466]/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#232466]">
                <ShieldCheck size={13} />
                Administrator access
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Sign in to manage your meetings and collaborate with your team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#232466]"
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#232466] focus:bg-white focus:ring-4 focus:ring-[#232466]/[0.07]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#232466]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-12 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#232466] focus:bg-white focus:ring-4 focus:ring-[#232466]/[0.07]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#232466] px-4 text-sm font-semibold text-white shadow-lg shadow-[#232466]/15 transition duration-200 hover:bg-[#1b1c53] hover:shadow-xl hover:shadow-[#232466]/20 focus:outline-none focus:ring-4 focus:ring-[#232466]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to workspace
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Secure workspace
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#232466]"
              />
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Your workspace, protected
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Authorized administrators can access meeting management and
                  workspace controls.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} AVSI Technologies. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;