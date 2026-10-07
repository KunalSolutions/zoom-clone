import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MeetingHeader from "../components/MeetingHeader";
import VideoGrid from "../components/VideoGrid";
import MeetingControls from "../components/MeetingControls";
import useWebRTC from "../hooks/useWebRTC";

import {
  useGetMeetingQuery,
  useJoinMeetingMutation,
  useLeaveMeetingMutation,
  useStartMeetingMutation,
  useGetMeetingParticipantsQuery,
} from "../services/apiSlice";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const joinedRef = useRef(false);

  const [apiError, setApiError] = useState("");
  const [showParticipants, setShowParticipants] =
    useState(false);

  const {
    data: meetingData,
    isLoading: meetingLoading,
    error: meetingError,
  } = useGetMeetingQuery(meetingId);

  const {
    data: participantsData,
    isLoading: participantsLoading,
  } = useGetMeetingParticipantsQuery(meetingId, {
    pollingInterval: 3000,
  });

  const [joinMeeting, { isLoading: joining }] =
    useJoinMeetingMutation();

  const [leaveMeetingApi] =
    useLeaveMeetingMutation();

  const [startMeeting] =
    useStartMeetingMutation();

  const {
    localVideoRef,
    remoteVideoRef,
    remoteParticipants,
    connected,
    remoteConnected,
    micEnabled,
    cameraEnabled,
    inMeeting,
    toggleMic,
    toggleCamera,
    leaveMeeting: leaveWebRTC,
  } = useWebRTC(meetingId);

  const meeting = meetingData?.meeting;

  const participants =
    participantsData?.participants || [];

  useEffect(() => {
    if (
      !meetingId ||
      !meeting ||
      joinedRef.current
    ) {
      return;
    }

    const join = async () => {
      try {
        joinedRef.current = true;

        setApiError("");

        await joinMeeting({
          meetingId,
        }).unwrap();

        if (meeting.status === "WAITING") {
          await startMeeting(
            meetingId
          ).unwrap();
        }
      } catch (error) {
        joinedRef.current = false;

        console.error(
          "Join meeting error:",
          error
        );

        setApiError(
          error?.data?.message ||
            error?.message ||
            "Unable to join meeting"
        );
      }
    };

    join();
  }, [
    meetingId,
    meeting,
    joinMeeting,
    startMeeting,
  ]);

  const handleLeaveMeeting = async () => {
    try {
      await leaveMeetingApi(
        meetingId
      ).unwrap();
    } catch (error) {
      console.error(
        "Leave meeting API error:",
        error
      );
    }

    leaveWebRTC();
  };

  if (meetingLoading || joining) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />

          <p className="mt-4 text-sm text-zinc-400">
            Joining meeting...
          </p>
        </div>
      </div>
    );
  }

  if (meetingError || apiError) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#181818] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950/50">
            <span className="text-xl text-red-400">
              !
            </span>
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to Join Meeting
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            {apiError ||
              meetingError?.data?.message ||
              "Meeting could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!inMeeting) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#181818] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <span className="text-2xl text-zinc-300">
              ✓
            </span>
          </div>

          <h1 className="text-xl font-semibold text-white">
            You left the meeting
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            The meeting has ended for you.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#111111] text-white flex flex-col">
      <MeetingHeader
        meetingId={meetingId}
        connected={connected}
      />

      <div className="relative flex-1 min-h-0">
        <VideoGrid
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          remoteParticipants={
            remoteParticipants
          }
          micEnabled={micEnabled}
          cameraEnabled={cameraEnabled}
          remoteConnected={
            remoteConnected
          }
        />

        {showParticipants && (
          <div className="absolute right-4 top-4 bottom-4 z-20 w-80 rounded-xl border border-zinc-800 bg-[#181818] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Participants
                </h2>

                <p className="text-xs text-zinc-500">
                  {participants.length} participant
                  {participants.length !==
                  1
                    ? "s"
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowParticipants(
                    false
                  )
                }
                className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="max-h-full overflow-y-auto p-3">
              {participantsLoading ? (
                <p className="px-2 py-4 text-sm text-zinc-500">
                  Loading participants...
                </p>
              ) : participants.length ===
                0 ? (
                <p className="px-2 py-4 text-sm text-zinc-500">
                  No participants found.
                </p>
              ) : (
                <div className="space-y-2">
                  {participants.map(
                    (participant) => {
                      const user =
                        participant.userId;

                      return (
                        <div
                          key={
                            participant._id
                          }
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-800"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                            {user?.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              "U"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {user?.name ||
                                "Unknown User"}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {
                                participant.role
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                participant.status ===
                                "JOINED"
                                  ? "bg-green-500"
                                  : "bg-zinc-600"
                              }`}
                            />

                            <span className="text-[11px] text-zinc-500">
                              {
                                participant.status
                              }
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <MeetingControls
        micEnabled={micEnabled}
        cameraEnabled={
          cameraEnabled
        }
        toggleMic={toggleMic}
        toggleCamera={
          toggleCamera
        }
        leaveMeeting={
          handleLeaveMeeting
        }
        onParticipants={() =>
          setShowParticipants(
            (prev) => !prev
          )
        }
      />
    </div>
  );
};

export default Meeting;