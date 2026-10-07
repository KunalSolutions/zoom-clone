import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users } from "lucide-react";

const Entry = () => {
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-5">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to ZoomLite
          </h1>

          <p className="mt-3 text-gray-500">
            Choose how you want to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/login"
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition"
          >
            <div className="w-14 h-14 rounded-xl bg-[#232466] flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">
              Admin Login
            </h2>

            <p className="mt-2 text-gray-500">
              Login as an administrator to create and manage meetings.
            </p>

            <div className="mt-6 text-[#232466] font-semibold">
              Continue as Admin →
            </div>
          </Link>

          <Link
            to="/join"
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition"
          >
            <div className="w-14 h-14 rounded-xl bg-[#EF5622] flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">
              Join Meeting
            </h2>

            <p className="mt-2 text-gray-500">
              Enter your name and meeting code to request access.
            </p>

            <div className="mt-6 text-[#EF5622] font-semibold">
              Join a Meeting →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Entry;