import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Users,
  MessageSquare,
  MoreHorizontal,
  PhoneOff,
} from "lucide-react";

const MeetingControls = ({
  micEnabled,
  cameraEnabled,
  toggleMic,
  toggleCamera,
  leaveMeeting,
  onParticipants,
}) => {
  return (
    <div className="h-20 shrink-0 border-t border-zinc-800 bg-[#181818] px-4 flex items-center justify-center">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleMic}
          className={`h-12 w-12 rounded-xl flex items-center justify-center transition ${
            micEnabled
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
          title={micEnabled ? "Mute" : "Unmute"}
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
          className={`h-12 w-12 rounded-xl flex items-center justify-center transition ${
            cameraEnabled
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
          title={
            cameraEnabled
              ? "Turn off camera"
              : "Turn on camera"
          }
        >
          {cameraEnabled ? (
            <Video size={20} />
          ) : (
            <VideoOff size={20} />
          )}
        </button>

        <button
          type="button"
          className="h-12 w-12 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
          title="Share screen"
        >
          <MonitorUp size={20} />
        </button>

        <button
          type="button"
          onClick={onParticipants}
          className="h-12 w-12 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
          title="Participants"
        >
          <Users size={20} />
        </button>

        <button
          type="button"
          className="h-12 w-12 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
          title="Chat"
        >
          <MessageSquare size={20} />
        </button>

        <button
          type="button"
          className="h-12 w-12 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center transition"
          title="More"
        >
          <MoreHorizontal size={20} />
        </button>

        <div className="mx-1 h-8 w-px bg-zinc-700" />

        <button
          type="button"
          onClick={leaveMeeting}
          className="h-12 px-5 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 transition"
          title="Leave meeting"
        >
          <PhoneOff size={19} />

          <span className="hidden sm:inline text-sm font-medium">
            Leave
          </span>
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;