import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Video,
  ArrowRight,
  ShieldCheck,
  Users,
  Hash,
} from "lucide-react";

import { useRequestToJoinMeetingMutation } from "../redux/api/meetingParticipantApi";

const JoinMeeting = () => {
  const navigate = useNavigate();

  const [requestToJoinMeeting, { isLoading }] =
    useRequestToJoinMeetingMutation();

  const [formData, setFormData] = useState({
    name: "",
    meetingCode: "",
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

    if (!formData.name.trim() || !formData.meetingCode.trim()) {
      setError("Name and meeting code are required");
      return;
    }

    try {
      const response = await requestToJoinMeeting({
        name: formData.name.trim(),
        meetingCode: formData.meetingCode.trim(),
      }).unwrap();

      navigate(`/waiting/${response.participant.id}`);
    } catch (error) {
      setError(
        error?.data?.message || "Failed to send join request"
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#232466]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#EF5622]/[0.07] blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#EF5622]"
        >
          <ArrowLeft size={17} />
          Back to workspace
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
          <div className="h-1.5 bg-gradient-to-r from-[#EF5622] via-[#f58252] to-[#232466]" />

          <div className="p-6 sm:p-9">
            <div className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EF5622] shadow-lg shadow-[#EF5622]/20">
                <Video size={27} className="text-white" strokeWidth={1.8} />
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#EF5622]/10 bg-[#EF5622]/[0.05] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#EF5622]">
                <Users size={13} />
                Team member access
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Join a meeting
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Enter your details below to request access to your team's
                meeting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Your full name
                </label>

                <div className="group relative">
                  <User
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#EF5622]"
                  />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    maxLength={100}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#EF5622] focus:bg-white focus:ring-4 focus:ring-[#EF5622]/[0.08]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="meetingCode"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Meeting code
                </label>

                <div className="group relative">
                  <Hash
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#EF5622]"
                  />

                  <input
                    id="meetingCode"
                    type="text"
                    name="meetingCode"
                    value={formData.meetingCode}
                    onChange={handleChange}
                    placeholder="Enter the meeting code"
                    autoComplete="off"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-[#EF5622] focus:bg-white focus:ring-4 focus:ring-[#EF5622]/[0.08]"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Ask your meeting administrator for the meeting code.
                </p>
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
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#EF5622] px-4 text-sm font-semibold text-white shadow-lg shadow-[#EF5622]/15 transition duration-200 hover:bg-[#df4818] hover:shadow-xl hover:shadow-[#EF5622]/20 focus:outline-none focus:ring-4 focus:ring-[#EF5622]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending request...
                  </>
                ) : (
                  <>
                    Request to join
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
                Meeting access
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
                  Waiting room protection
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your request is sent to the meeting administrator for
                  approval before you can enter.
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

export default JoinMeeting;