import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Copy,
  MessageSquare,
} from "lucide-react";

import ScreenShareControls from "./ScreenShareControls";
import RemoteVideo from "./RemoteVideo";

const MeetingUI = ({
  role,
  meetingId,
  videoRef,
  remoteStreams,
  micEnabled,
  cameraEnabled,
  showParticipants,
  copied,
  screenSharing,
  toggleMic,
  toggleCamera,
  toggleScreenShare,
  leaveMeeting,
  copyMeetingCode,
  setShowParticipants,
  children,
}) => {
  const totalVideos = remoteStreams.length + 1;

  const gridClass =
    totalVideos === 1
      ? "grid-cols-1"
      : totalVideos === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      <header className="h-16 shrink-0 border-b border-zinc-800 bg-[#181818] px-5 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold">Z</span>
          </div>

          <div>
            <span className="text-lg font-semibold">
              AVSI WORKSPACE
            </span>

            <div className="hidden sm:block text-xs text-zinc-500">
              {role === "admin" ? "Host" : "Participant"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === "admin" && (
            <button
              type="button"
              onClick={copyMeetingCode}
              className="h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-2 text-sm"
            >
              <Copy size={15} />
              {copied ? "Copied" : "Share Code"}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setShowParticipants(!showParticipants)
            }
            className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-center"
            title="Toggle participants"
          >
            <Users size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col md:flex-row">
        <section className="flex-1 min-w-0 p-4 md:p-6">
          <div
            className={`min-h-[calc(100vh-160px)] grid ${gridClass} gap-4`}
          >
            <div className="relative min-h-[300px] rounded-2xl overflow-hidden bg-black border border-zinc-800">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${
                  cameraEnabled || screenSharing
                    ? ""
                    : "opacity-0"
                }`}
              />

              {!cameraEnabled && !screenSharing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-semibold">
                    {role === "admin" ? "A" : "U"}
                  </div>
                </div>
              )}

              <div className="absolute left-4 bottom-4 bg-black/70 rounded-lg px-3 py-1.5 text-sm">
                {role === "admin" ? "You · Host" : "You"}
                {screenSharing ? " · Sharing screen" : ""}
              </div>

              <div className="absolute right-4 bottom-4">
                <div className="h-8 w-8 rounded-full bg-black/70 flex items-center justify-center">
                  {micEnabled ? (
                    <Mic size={15} />
                  ) : (
                    <MicOff
                      size={15}
                      className="text-red-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {remoteStreams.map((remote) => (
              <RemoteVideo
                key={remote.socketId}
                stream={remote.stream}
                socketId={remote.socketId}
              />
            ))}

            {remoteStreams.length === 0 && (
              <div className="relative min-h-[300px] rounded-2xl overflow-hidden bg-[#181818] border border-zinc-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
                    <Users
                      size={28}
                      className="text-zinc-500"
                    />
                  </div>

                  <p className="mt-4 text-zinc-400">
                    No participants yet
                  </p>

                  {role === "admin" && (
                    <p className="mt-1 text-sm text-zinc-600">
                      Accept users to let them join
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {role === "admin" && showParticipants && children}
      </main>

      <footer className="h-20 shrink-0 border-t border-zinc-800 bg-[#181818] flex items-center justify-center gap-3 px-4">
        <button
          type="button"
          onClick={toggleMic}
          title={micEnabled ? "Mute" : "Unmute"}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
            micEnabled
              ? "bg-zinc-800 hover:bg-zinc-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {micEnabled ? (
            <Mic size={20} />
          ) : (
            <MicOff size={20} />
          )}
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          title={
            cameraEnabled
              ? "Turn camera off"
              : "Turn camera on"
          }
          className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
            cameraEnabled
              ? "bg-zinc-800 hover:bg-zinc-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {cameraEnabled ? (
            <Video size={20} />
          ) : (
            <VideoOff size={20} />
          )}
        </button>

        <button
          type="button"
          className="hidden sm:flex h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 items-center justify-center transition"
          title="Chat (not implemented)"
          disabled
        >
          <MessageSquare size={20} />
        </button>

        <ScreenShareControls
          screenSharing={screenSharing}
          toggleScreenShare={toggleScreenShare}
        />

        <button
          type="button"
          onClick={leaveMeeting}
          className="h-12 px-5 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center gap-2 font-medium ml-3"
        >
          <PhoneOff size={19} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </footer>
    </div>
  );
};

export default MeetingUI;