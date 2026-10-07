import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Video } from "lucide-react";

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

    if (!formData.name || !formData.meetingCode) {
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
            <div className="w-12 h-12 rounded-xl bg-[#EF5622] flex items-center justify-center mb-5">
              <Video className="text-white" size={24} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Join Meeting
            </h1>

            <p className="mt-2 text-gray-500">
              Enter your name and meeting code to request access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-[#EF5622]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Code
              </label>

              <div className="relative">
                <Video
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="meetingCode"
                  value={formData.meetingCode}
                  onChange={handleChange}
                  placeholder="Enter meeting code"
                  className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-[#EF5622]"
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
              className="w-full h-12 rounded-xl bg-[#EF5622] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {isLoading ? "Joining..." : "Join Meeting"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;