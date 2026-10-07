import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Video, XCircle } from "lucide-react";

import { useGetParticipantStatusQuery } from "../redux/api/meetingParticipantApi";

const WaitingRoom = () => {
  const navigate = useNavigate();
  const { participantId } = useParams();

  const {
    data,
    isLoading,
    isError,
  } = useGetParticipantStatusQuery(participantId, {
    pollingInterval: 3000,
  });

  const participant = data?.participant;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-zinc-400">
            Checking meeting request...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !participant) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <XCircle
            size={50}
            className="text-red-500 mx-auto"
          />

          <h1 className="mt-5 text-2xl font-semibold">
            Request not found
          </h1>

          <p className="mt-2 text-zinc-400">
            Your meeting request could not be found.
          </p>

          <button
            type="button"
            onClick={() => navigate("/join")}
            className="mt-6 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium"
          >
            Join Again
          </button>
        </div>
      </div>
    );
  }

  if (participant.status === "ACCEPTED") {
    navigate(`/meeting/${participant.meetingId}`);

    return null;
  }

  if (participant.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <XCircle
            size={50}
            className="text-red-500 mx-auto"
          />

          <h1 className="mt-5 text-2xl font-semibold">
            Request Rejected
          </h1>

          <p className="mt-2 text-zinc-400">
            The admin has rejected your request to join
            this meeting.
          </p>

          <button
            type="button"
            onClick={() => navigate("/join")}
            className="mt-6 h-11 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition font-medium"
          >
            Join Another Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">

      <header className="h-16 border-b border-zinc-800 bg-[#181818] px-5 md:px-8 flex items-center">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold">Z</span>
          </div>

          <span className="text-xl font-semibold">
            ZoomLite
          </span>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5">
        <div className="w-full max-w-md">

          <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-8 text-center">

            <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
              <Clock
                size={30}
                className="text-blue-500"
              />
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Waiting for approval
            </h1>

            <p className="mt-3 text-zinc-400 leading-6">
              Hi, {participant.name}. Your request has been
              sent to the meeting admin.
            </p>

            <div className="mt-6 rounded-xl bg-[#111111] border border-zinc-800 p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                Waiting for admin
              </div>
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              This page will automatically continue when
              your request is accepted.
            </p>

          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <Video size={14} />
            ZoomLite Meeting
          </div>

        </div>
      </main>
    </div>
  );
};

export default WaitingRoom;