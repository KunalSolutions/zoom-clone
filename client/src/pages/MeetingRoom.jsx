import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { VideoOff } from "lucide-react";

import socket from "../socket";

import {
  useGetPendingRequestsQuery,
  useAcceptParticipantMutation,
  useRejectParticipantMutation,
} from "../redux/api/meetingParticipantApi";

import MeetingUI from "../components/meeting/MeetingUI";
import JoinRequests from "../components/meeting/JoinRequests";

const MeetingRoom = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role") || "participant";

  // Media refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // WebRTC refs
  const peerConnectionsRef = useRef({});
  const pendingCandidatesRef = useRef({});

  // UI state
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Admin requests
  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useGetPendingRequestsQuery(meetingId, {
    skip: role !== "admin",
    pollingInterval: 3000,
  });

  const [acceptParticipant, { isLoading: accepting }] =
    useAcceptParticipantMutation();

  const [rejectParticipant, { isLoading: rejecting }] =
    useRejectParticipantMutation();

  const pendingParticipants = pendingData?.participants || [];

  // Remote streams
  const addRemoteStream = (socketId, stream) => {
    setRemoteStreams((current) => {
      const existing = current.find(
        (item) => item.socketId === socketId
      );

      if (existing) {
        return current.map((item) =>
          item.socketId === socketId
            ? { ...item, stream }
            : item
        );
      }

      return [...current, { socketId, stream }];
    });
  };

  const removeRemoteStream = (socketId) => {
    setRemoteStreams((current) =>
      current.filter((item) => item.socketId !== socketId)
    );
  };

  // Create peer connection
  const createPeerConnection = (targetSocketId) => {
    if (peerConnectionsRef.current[targetSocketId]) {
      return peerConnectionsRef.current[targetSocketId];
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    peerConnectionsRef.current[targetSocketId] = peerConnection;
    pendingCandidatesRef.current[targetSocketId] = [];

    // Send camera/audio, or the active screen instead of camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        if (track.kind === "video" && screenStreamRef.current) {
          const screenTrack =
            screenStreamRef.current.getVideoTracks()[0];

          if (screenTrack) {
            peerConnection.addTrack(
              screenTrack,
              screenStreamRef.current
            );
            return;
          }
        }

        peerConnection.addTrack(track, streamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (remoteStream) {
        addRemoteStream(targetSocketId, remoteStream);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      if (
        state === "failed" ||
        state === "closed" ||
        state === "disconnected"
      ) {
        removeRemoteStream(targetSocketId);
      }
    };

    return peerConnection;
  };

  // Offers
  const createOffer = async (targetSocketId) => {
    try {
      const peerConnection =
        createPeerConnection(targetSocketId);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", { targetSocketId, offer });
    } catch (err) {
      console.error("Create offer error:", err);
    }
  };

  // Incoming offer
  const handleOffer = async ({ senderSocketId, offer }) => {
    try {
      const peerConnection =
        createPeerConnection(senderSocketId);

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const candidates =
        pendingCandidatesRef.current[senderSocketId] || [];

      for (const candidate of candidates) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }

      pendingCandidatesRef.current[senderSocketId] = [];

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("answer", {
        targetSocketId: senderSocketId,
        answer,
      });
    } catch (err) {
      console.error("Handle offer error:", err);
    }
  };

  // Incoming answer
  const handleAnswer = async ({ senderSocketId, answer }) => {
    try {
      const peerConnection =
        peerConnectionsRef.current[senderSocketId];

      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      const candidates =
        pendingCandidatesRef.current[senderSocketId] || [];

      for (const candidate of candidates) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }

      pendingCandidatesRef.current[senderSocketId] = [];
    } catch (err) {
      console.error("Handle answer error:", err);
    }
  };

  // Incoming ICE candidate
  const handleIceCandidate = async ({
    senderSocketId,
    candidate,
  }) => {
    try {
      const peerConnection =
        peerConnectionsRef.current[senderSocketId];

      if (!peerConnection) return;

      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        if (!pendingCandidatesRef.current[senderSocketId]) {
          pendingCandidatesRef.current[senderSocketId] = [];
        }

        pendingCandidatesRef.current[senderSocketId].push(candidate);
      }
    } catch (err) {
      console.error("ICE candidate error:", err);
    }
  };

  const closePeerConnection = (socketId) => {
    const peerConnection =
      peerConnectionsRef.current[socketId];

    if (peerConnection) peerConnection.close();

    delete peerConnectionsRef.current[socketId];
    delete pendingCandidatesRef.current[socketId];

    removeRemoteStream(socketId);
  };

  // Start local camera and microphone
  useEffect(() => {
    let mounted = true;

    const startMedia = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (!socket.connected) socket.connect();

        socket.emit("join-meeting", {
          meetingId,
          role,
          participantId: searchParams.get("participantId") || null,
        });
      } catch (err) {
        console.error("Camera/microphone error:", err);
        setError(
          "Camera or microphone permission is required to join the meeting."
        );
      }
    };

    startMedia();

    return () => {
      mounted = false;

      // Release camera, microphone and screen if this page unmounts
      screenStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      Object.values(peerConnectionsRef.current).forEach(
        (connection) => connection.close()
      );

      peerConnectionsRef.current = {};
      pendingCandidatesRef.current = {};

      socket.off("existing-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [meetingId, role]);

  // Socket events
  useEffect(() => {
    const handleExistingUsers = (users) => {
      users.forEach((user) => createOffer(user.socketId));
    };

    const handleUserJoined = (data) => {
      console.log("User joined:", data.socketId);
    };

    const handleUserLeft = ({ socketId }) => {
      closePeerConnection(socketId);
    };

    socket.on("existing-users", handleExistingUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("existing-users", handleExistingUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left", handleUserLeft);
    };
  }, []);

  // Microphone
  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  };

  // Camera
  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  };

  // Stop screen sharing and restore camera for every peer
  const stopScreenShare = async () => {
    const screenStream = screenStreamRef.current;
    if (!screenStream) return;

    const cameraTrack = streamRef.current?.getVideoTracks()[0];

    for (const peerConnection of Object.values(
      peerConnectionsRef.current
    )) {
      const sender = peerConnection
        .getSenders()
        .find((item) => item.track?.kind === "video");

      if (sender && cameraTrack) {
        try {
          await sender.replaceTrack(cameraTrack);
        } catch (err) {
          console.error("Restore camera error:", err);
        }
      }
    }

    screenStream.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });

    screenStreamRef.current = null;

    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }

    setScreenSharing(false);
  };

  // Start screen sharing
  const toggleScreenShare = async () => {
    if (screenStreamRef.current) {
      await stopScreenShare();
      return;
    }

    try {
      const screenStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        screenStream.getTracks().forEach((track) => track.stop());
        return;
      }

      screenStreamRef.current = screenStream;

      for (const peerConnection of Object.values(
        peerConnectionsRef.current
      )) {
        const sender = peerConnection
          .getSenders()
          .find((item) => item.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setScreenSharing(true);
    } catch (err) {
      console.error("Screen sharing error:", err);

      if (err.name !== "NotAllowedError") {
        setError("Unable to start screen sharing. Please try again.");
      }
    }
  };

  // Accept request
  const handleAccept = async (participantId) => {
    try {
      await acceptParticipant(participantId).unwrap();
      refetchPending();
    } catch (err) {
      console.error("Accept participant error:", err);
    }
  };

  // Reject request
  const handleReject = async (participantId) => {
    try {
      await rejectParticipant(participantId).unwrap();
      refetchPending();
    } catch (err) {
      console.error("Reject participant error:", err);
    }
  };

  // Copy meeting code
  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  // Leave meeting
  const leaveMeeting = () => {
    socket.emit("leave-meeting", { meetingId });

    screenStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    Object.keys(peerConnectionsRef.current).forEach(
      closePeerConnection
    );

    socket.disconnect();

    navigate(
      role === "admin" ? "/admin/dashboard" : "/"
    );
  };

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-red-950 flex items-center justify-center mx-auto">
            <VideoOff size={30} className="text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Camera Access Required
          </h1>

          <p className="mt-3 text-zinc-400">{error}</p>

          <button
            type="button"
            onClick={leaveMeeting}
            className="mt-6 h-11 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
          >
            Leave Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <MeetingUI
      role={role}
      meetingId={meetingId}
      videoRef={videoRef}
      remoteStreams={remoteStreams}
      micEnabled={micEnabled}
      cameraEnabled={cameraEnabled}
      screenSharing={screenSharing}
      showParticipants={showParticipants}
      copied={copied}
      toggleMic={toggleMic}
      toggleCamera={toggleCamera}
      toggleScreenShare={toggleScreenShare}
      leaveMeeting={leaveMeeting}
      copyMeetingCode={copyMeetingCode}
      setShowParticipants={setShowParticipants}
    >
      <JoinRequests
        pendingData={pendingData}
        pendingLoading={pendingLoading}
        pendingParticipants={pendingParticipants}
        accepting={accepting}
        rejecting={rejecting}
        handleAccept={handleAccept}
        handleReject={handleReject}
      />
    </MeetingUI>
  );
};

export default MeetingRoom;