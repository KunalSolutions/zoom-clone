import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  LogOut,
  Plus,
  Users,
  Video,
  Clock,
  Check,
  X,
  Ban,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../redux/slices/authSlice";

import {
  useCreateMeetingMutation,
  useGetMyMeetingsQuery,
  useExpireMeetingMutation,
} from "../redux/api/meetingApi";

import {
  useGetPendingRequestsQuery,
  useAcceptParticipantMutation,
  useRejectParticipantMutation,
} from "../redux/api/meetingParticipantApi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const admin = useSelector((state) => state.auth.admin);

  const [selectedMeetingId, setSelectedMeetingId] =
    useState(null);

  const [meetingName, setMeetingName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     MEETINGS
  ========================= */

  const {
    data: meetingsData,
    isLoading: meetingsLoading,
    refetch: refetchMeetings,
  } = useGetMyMeetingsQuery(undefined, {
    pollingInterval: 5000,
  });

  const [createMeeting, { isLoading: creatingMeeting }] =
    useCreateMeetingMutation();

  const [expireMeeting, { isLoading: expiringMeeting }] =
    useExpireMeetingMutation();

  const meetings = meetingsData?.meetings || [];

  const activeMeetings = meetings.filter(
    (meeting) => meeting.status === "ACTIVE"
  );

  /* =========================
     AUTO SELECT ACTIVE MEETING
  ========================= */

  useEffect(() => {
    if (activeMeetings.length === 0) {
      setSelectedMeetingId(null);
      return;
    }

    const selectedStillExists = activeMeetings.some(
      (meeting) => meeting._id === selectedMeetingId
    );

    if (!selectedStillExists) {
      setSelectedMeetingId(activeMeetings[0]._id);
    }
  }, [meetingsData, selectedMeetingId]);

  /* =========================
     PENDING REQUESTS
  ========================= */

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useGetPendingRequestsQuery(selectedMeetingId, {
    skip: !selectedMeetingId,
    pollingInterval: 3000,
  });

  const [acceptParticipant] =
    useAcceptParticipantMutation();

  const [rejectParticipant] =
    useRejectParticipantMutation();

  const pendingParticipants =
    pendingData?.participants || [];

  /* =========================
     CREATE MEETING
  ========================= */

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    if (!meetingName.trim()) {
      setError("Meeting name is required");
      return;
    }

    try {
      setError("");

      const response = await createMeeting({
        name: meetingName.trim(),
      }).unwrap();

      setMeetingName("");
      setShowCreate(false);

      await refetchMeetings();

      if (response?.meeting?._id) {
        setSelectedMeetingId(response.meeting._id);
      }
    } catch (error) {
      setError(
        error?.data?.message ||
          "Failed to create meeting"
      );
    }
  };

  /* =========================
     EXPIRE MEETING
  ========================= */

  const handleExpireMeeting = async (meetingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to expire this meeting? The meeting code will no longer work."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await expireMeeting(meetingId).unwrap();

      if (selectedMeetingId === meetingId) {
        setSelectedMeetingId(null);
      }

      await refetchMeetings();
    } catch (error) {
      setError(
        error?.data?.message ||
          "Failed to expire meeting"
      );
    }
  };

  /* =========================
     ACCEPT REQUEST
  ========================= */

  const handleAccept = async (participantId) => {
    try {
      setError("");

      await acceptParticipant(
        participantId
      ).unwrap();

      await refetchPending();
    } catch (error) {
      setError(
        error?.data?.message ||
          "Failed to accept participant"
      );
    }
  };

  /* =========================
     REJECT REQUEST
  ========================= */

  const handleReject = async (participantId) => {
    try {
      setError("");

      await rejectParticipant(
        participantId
      ).unwrap();

      await refetchPending();
    } catch (error) {
      setError(
        error?.data?.message ||
          "Failed to reject participant"
      );
    }
  };

  /* =========================
     COPY CODE
  ========================= */

  const copyMeetingCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error(
        "Copy meeting code error:",
        error
      );
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* =========================
          HEADER
      ========================= */}

      <header className="h-16 border-b border-zinc-800 bg-[#181818] px-5 md:px-8 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold">
              Z
            </span>
          </div>

          <span className="text-xl font-semibold">
            ZoomLite
          </span>

        </div>

        <div className="flex items-center gap-4">

          <span className="hidden sm:block text-sm text-zinc-400">
            Hi, {admin?.name || "Admin"}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="h-10 px-4 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition flex items-center gap-2 text-sm"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="px-5 md:px-8 py-8 max-w-7xl mx-auto">

        {/* TOP */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="mt-1 text-zinc-500">
              Manage your meetings and participants.
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreate(true);
              setError("");
            }}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={19} />
            New Meeting
          </button>

        </div>

        {/* =========================
            STATS
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

          {/* TOTAL */}

          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm text-zinc-500">
                Total Meetings
              </span>

              <Video
                size={20}
                className="text-blue-500"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {meetings.length}
            </p>

          </div>

          {/* ACTIVE */}

          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm text-zinc-500">
                Active Meetings
              </span>

              <Video
                size={20}
                className="text-green-500"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {activeMeetings.length}
            </p>

          </div>

          {/* WAITING */}

          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-5">

            <div className="flex items-center justify-between">

              <span className="text-sm text-zinc-500">
                Waiting Requests
              </span>

              <Users
                size={20}
                className="text-yellow-500"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {pendingData?.count || 0}
            </p>

          </div>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =========================
            CREATE MEETING
        ========================= */}

        {showCreate && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#181818] p-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-semibold">
                  Create Meeting
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  A unique meeting code will be generated automatically.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleCreateMeeting}
              className="flex flex-col sm:flex-row gap-3"
            >

              <input
                type="text"
                value={meetingName}
                onChange={(e) => {
                  setMeetingName(e.target.value);
                  setError("");
                }}
                placeholder="Meeting name"
                className="flex-1 h-11 rounded-xl bg-[#111111] border border-zinc-800 px-4 text-white outline-none focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={creatingMeeting}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {creatingMeeting
                  ? "Creating..."
                  : "Create Meeting"}
              </button>

            </form>

          </div>
        )}

        {/* =========================
            MEETINGS
        ========================= */}

        <div className="mt-8">

          <div className="flex items-center justify-between mb-4">

            <h2 className="text-xl font-semibold">
              Your Meetings
            </h2>

            <span className="text-sm text-zinc-500">
              {meetings.length} meetings
            </span>

          </div>

          {meetingsLoading ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-10 text-center text-zinc-500">
              Loading meetings...
            </div>
          ) : meetings.length === 0 ? (

            <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-10 text-center">

              <Video
                size={40}
                className="mx-auto text-zinc-700"
              />

              <h3 className="mt-4 font-medium">
                No meetings yet
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Create your first meeting to get started.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {meetings.map((meeting) => (

                <div
                  key={meeting._id}
                  className="rounded-2xl border border-zinc-800 bg-[#181818] p-5"
                >

                  {/* MEETING HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="flex items-center gap-2">

                        <h3 className="font-semibold text-lg">
                          {meeting.name}
                        </h3>

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            meeting.status === "ACTIVE"
                              ? "bg-green-950 text-green-400"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {meeting.status}
                        </span>

                      </div>

                      <p className="text-xs text-zinc-600 mt-1">
                        Created{" "}
                        {new Date(
                          meeting.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                    <Video
                      size={20}
                      className={
                        meeting.status === "ACTIVE"
                          ? "text-blue-500"
                          : "text-zinc-700"
                      }
                    />

                  </div>

                  {/* =========================
                      MEETING CODE
                  ========================= */}

                  <div className="mt-5 rounded-xl bg-[#111111] border border-zinc-800 p-4">

                    <p className="text-xs text-zinc-500">
                      Meeting Code
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">

                      <span className="text-xl font-mono tracking-wider">
                        {meeting.meetingCode}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          copyMeetingCode(
                            meeting.meetingCode
                          )
                        }
                        className="h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-2 text-xs"
                      >
                        <Copy size={15} />
                        Copy
                      </button>

                    </div>

                  </div>

                  {/* =========================
                      ACTIONS
                  ========================= */}

                  {meeting.status === "ACTIVE" && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMeetingId(
                            meeting._id
                          )
                        }
                        className={`h-10 px-4 rounded-lg transition flex items-center gap-2 text-sm ${
                          selectedMeetingId === meeting._id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        <Users size={16} />

                        Requests

                        {selectedMeetingId ===
                          meeting._id &&
                          pendingData?.count > 0 && (
                            <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-yellow-500 text-black text-xs flex items-center justify-center font-semibold">
                              {pendingData.count}
                            </span>
                          )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/meeting/${meeting._id}?role=admin`)
                        }
                        className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                      >
                        <Video size={16} />
                        Open Meeting
                      </button>

                      <button
                        type="button"
                        disabled={expiringMeeting}
                        onClick={() =>
                          handleExpireMeeting(
                            meeting._id
                          )
                        }
                        className="h-10 px-4 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 transition flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Ban size={16} />
                        Expire
                      </button>

                    </div>
                  )}

                  {/* =========================
                      JOIN REQUESTS
                  ========================= */}

                  {selectedMeetingId ===
                    meeting._id && (
                    <div className="mt-5 border-t border-zinc-800 pt-5">

                      <div className="flex items-center justify-between mb-4">

                        <div>
                          <h4 className="font-medium">
                            Join Requests
                          </h4>

                          <p className="text-xs text-zinc-600 mt-1">
                            Automatically checking for new requests
                          </p>
                        </div>

                        <span className="text-xs text-zinc-500">
                          {pendingData?.count || 0} waiting
                        </span>

                      </div>

                      {pendingLoading ? (

                        <div className="rounded-xl bg-[#111111] border border-zinc-800 p-5 text-center">

                          <div className="h-6 w-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto" />

                          <p className="mt-3 text-sm text-zinc-500">
                            Loading requests...
                          </p>

                        </div>

                      ) : pendingParticipants.length === 0 ? (

                        <div className="rounded-xl bg-[#111111] border border-zinc-800 p-5 text-center">

                          <Clock
                            size={22}
                            className="mx-auto text-zinc-600"
                          />

                          <p className="mt-2 text-sm text-zinc-500">
                            No pending requests
                          </p>

                        </div>

                      ) : (

                        <div className="space-y-3">

                          {pendingParticipants.map(
                            (participant) => (

                              <div
                                key={participant._id}
                                className="rounded-xl bg-[#111111] border border-zinc-800 p-4 flex items-center justify-between gap-3"
                              >

                                <div className="flex items-center gap-3">

                                  <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Users size={17} />
                                  </div>

                                  <div>

                                    <p className="text-sm font-medium">
                                      {participant.name}
                                    </p>

                                    <p className="text-xs text-yellow-500 mt-1">
                                      Waiting to join
                                    </p>

                                  </div>

                                </div>

                                <div className="flex items-center gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAccept(
                                        participant._id
                                      )
                                    }
                                    className="h-9 w-9 rounded-lg bg-green-950 text-green-400 hover:bg-green-900 flex items-center justify-center"
                                    title="Accept"
                                  >
                                    <Check size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReject(
                                        participant._id
                                      )
                                    }
                                    className="h-9 w-9 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 flex items-center justify-center"
                                    title="Reject"
                                  >
                                    <X size={17} />
                                  </button>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;