import { Copy, MoreVertical, Wifi } from "lucide-react";

const MeetingHeader = ({ meetingId, connected }) => {
  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      console.log("Meeting ID copied");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <header className="h-16 w-full border-b border-zinc-800 bg-[#181818] px-4 md:px-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>

          <span className="text-white text-lg font-semibold">
            AVSI WORKSPACE
          </span>
        </div>

        <div className="hidden sm:block h-5 w-px bg-zinc-700" />

        <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
          <span>Meeting ID:</span>

          <span className="text-zinc-200 font-medium">
            {meetingId}
          </span>

          <button
            type="button"
            onClick={copyMeetingId}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            title="Copy meeting ID"
          >
            <Copy size={15} />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Wifi
            size={15}
            className={
              connected ? "text-green-500" : "text-red-500"
            }
          />

          <span
            className={
              connected ? "text-green-400" : "text-red-400"
            }
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <button
          type="button"
          className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          title="More options"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  );
};

export default MeetingHeader;