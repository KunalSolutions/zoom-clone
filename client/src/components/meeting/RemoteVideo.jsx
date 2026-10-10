import { useEffect, useRef } from "react";

const RemoteVideo = ({ stream, socketId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.srcObject = stream;
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="relative min-h-[300px] rounded-2xl overflow-hidden bg-black border border-zinc-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <div className="absolute left-4 bottom-4 bg-black/70 rounded-lg px-3 py-1.5 text-sm">
        Participant
      </div>
    </div>
  );
};

export default RemoteVideo;