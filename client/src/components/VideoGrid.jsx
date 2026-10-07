import {
  Maximize2,
  MicOff,
  User,
} from "lucide-react";

const VideoGrid = ({
  localVideoRef,
  remoteVideoRef,
  remoteParticipants = [],
  micEnabled,
  cameraEnabled,
}) => {
  const totalParticipants =
    1 + remoteParticipants.length;

  const getGridClass = () => {
    if (totalParticipants === 1) {
      return "grid-cols-1";
    }

    if (totalParticipants === 2) {
      return "grid-cols-1 md:grid-cols-2";
    }

    if (totalParticipants <= 4) {
      return "grid-cols-1 sm:grid-cols-2";
    }

    if (totalParticipants <= 6) {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }

    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-[#111111] p-3 md:p-5">
      <div
        className={`min-h-full w-full grid ${getGridClass()} gap-3`}
      >
        {/* ================================================= */}
        {/* LOCAL VIDEO */}
        {/* ================================================= */}

        <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-zinc-800 bg-[#1c1c1c]">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${
              cameraEnabled
                ? "block"
                : "hidden"
            }`}
          />

          {!cameraEnabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#202020]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700">
                <User
                  size={38}
                  className="text-zinc-300"
                />
              </div>

              <p className="mt-3 text-sm text-zinc-300">
                Camera is off
              </p>
            </div>
          )}

          {/* Name */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5">
            <span className="text-sm text-white">
              You
            </span>

            {!micEnabled && (
              <MicOff
                size={14}
                className="text-red-400"
              />
            )}
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={() => {
              if (
                localVideoRef.current?.requestFullscreen
              ) {
                localVideoRef.current.requestFullscreen();
              }
            }}
            className="absolute right-3 top-3 rounded-md bg-black/50 p-2 text-zinc-300 transition hover:bg-black/80 hover:text-white"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* ================================================= */}
        {/* REMOTE PARTICIPANTS */}
        {/* ================================================= */}

        {remoteParticipants.map(
          (participant) => (
            <RemoteVideo
              key={participant.socketId}
              participant={participant}
            />
          )
        )}

        {/* ================================================= */}
        {/* BACKWARD COMPATIBILITY */}
        {/* ================================================= */}

        {remoteParticipants.length === 0 &&
          remoteVideoRef && (
            <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-zinc-800 bg-[#1c1c1c]">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#202020]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700">
                  <User
                    size={38}
                    className="text-zinc-300"
                  />
                </div>

                <p className="mt-3 text-sm text-zinc-400">
                  Waiting for participant...
                </p>
              </div>

              <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-1.5">
                <span className="text-sm text-white">
                  Participant
                </span>
              </div>
            </div>
          )}
      </div>
    </main>
  );
};

const RemoteVideo = ({
  participant,
}) => {
  const videoRef = (video) => {
    if (!video || !participant.stream) {
      return;
    }

    if (
      video.srcObject !== participant.stream
    ) {
      video.srcObject =
        participant.stream;
    }

    video.muted = false;
    video.autoplay = true;
    video.playsInline = true;

    video.play().catch((error) => {
      console.warn(
        "Remote video autoplay blocked:",
        error
      );
    });
  };

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-zinc-800 bg-[#1c1c1c]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-1.5">
        <span className="text-sm text-white">
          Participant
        </span>
      </div>

      <button
        type="button"
        onClick={(event) => {
          const video =
            event.currentTarget
              .parentElement
              ?.querySelector("video");

          if (video?.requestFullscreen) {
            video.requestFullscreen();
          }
        }}
        className="absolute right-3 top-3 rounded-md bg-black/50 p-2 text-zinc-300 transition hover:bg-black/80 hover:text-white"
        title="Fullscreen"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
};

export default VideoGrid;