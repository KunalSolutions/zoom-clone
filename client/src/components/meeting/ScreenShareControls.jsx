import { MonitorUp, MonitorStop } from "lucide-react";

function ScreenShareControls({ screenSharing, toggleScreenShare }) {
  return (
    <button
      type="button"
      onClick={toggleScreenShare}
      title={screenSharing ? "Stop sharing" : "Share screen"}
      className={`hidden sm:flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
        screenSharing
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-zinc-800 text-white hover:bg-zinc-700"
      }`}
    >
      {screenSharing ? (
        <>
          <MonitorStop size={18} />
          Stop Sharing
        </>
      ) : (
        <>
          <MonitorUp size={18} />
          Share Screen
        </>
      )}
    </button>
  );
}

export default ScreenShareControls;