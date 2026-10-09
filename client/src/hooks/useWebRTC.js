import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useWebRTC = (meetingId) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Multiple peer connections
  const peerConnectionsRef = useRef(new Map());

  // ICE candidates received before remote description
  const pendingCandidatesRef = useRef(new Map());

  const localStreamRef = useRef(null);
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);

  const [remoteParticipants, setRemoteParticipants] =
    useState([]);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [inMeeting, setInMeeting] = useState(true);

  // =====================================================
  // GET LOCAL MEDIA
  // =====================================================

  const getLocalMedia = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.playsInline = true;

      await localVideoRef.current.play().catch(() => {});
    }

    return stream;
  };

  // =====================================================
  // ADD REMOTE PARTICIPANT
  // =====================================================

  const addRemoteParticipant = (socketId, stream) => {
    setRemoteParticipants((current) => {
      const existing = current.find(
        (participant) => participant.socketId === socketId
      );

      if (existing) {
        return current.map((participant) =>
          participant.socketId === socketId
            ? {
                ...participant,
                stream,
              }
            : participant
        );
      }

      return [
        ...current,
        {
          socketId,
          stream,
        },
      ];
    });
  };

  // =====================================================
  // REMOVE REMOTE PARTICIPANT
  // =====================================================

  const removeRemoteParticipant = (socketId) => {
    setRemoteParticipants((current) =>
      current.filter(
        (participant) =>
          participant.socketId !== socketId
      )
    );
  };

  // =====================================================
  // CREATE PEER CONNECTION
  // =====================================================

  const createPeerConnection = async (targetSocketId) => {
    const existing =
      peerConnectionsRef.current.get(targetSocketId);

    if (existing) {
      return existing;
    }

    const stream = await getLocalMedia();

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnectionsRef.current.set(
      targetSocketId,
      peerConnection
    );

    // ===================================================
    // ADD LOCAL TRACKS
    // ===================================================

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    // ===================================================
    // REMOTE TRACKS
    // ===================================================

    peerConnection.ontrack = (event) => {
      console.log(
        "Remote track received:",
        targetSocketId,
        event.track.kind
      );

      const remoteStream =
        event.streams?.[0];

      if (!remoteStream) {
        return;
      }

      addRemoteParticipant(
        targetSocketId,
        remoteStream
      );
    };

    // ===================================================
    // ICE CANDIDATE
    // ===================================================

    peerConnection.onicecandidate = (event) => {
      if (
        event.candidate &&
        socketRef.current
      ) {
        socketRef.current.emit(
          "ice-candidate",
          {
            meetingId,
            targetSocketId,
            candidate: event.candidate,
          }
        );
      }
    };

    // ===================================================
    // CONNECTION STATE
    // ===================================================

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `WebRTC [${targetSocketId}] state:`,
        peerConnection.connectionState
      );

      if (
        peerConnection.connectionState ===
          "failed" ||
        peerConnection.connectionState ===
          "closed"
      ) {
        removePeerConnection(targetSocketId);
      }
    };

    return peerConnection;
  };

  // =====================================================
  // REMOVE PEER CONNECTION
  // =====================================================

  const removePeerConnection = (socketId) => {
    const peerConnection =
      peerConnectionsRef.current.get(socketId);

    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.onconnectionstatechange = null;

      peerConnection.close();

      peerConnectionsRef.current.delete(
        socketId
      );
    }

    pendingCandidatesRef.current.delete(
      socketId
    );

    removeRemoteParticipant(socketId);
  };

  // =====================================================
  // ADD PENDING ICE CANDIDATES
  // =====================================================

  const addPendingCandidates = async (
    socketId,
    peerConnection
  ) => {
    const candidates =
      pendingCandidatesRef.current.get(
        socketId
      );

    if (!candidates?.length) {
      return;
    }

    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error(
          "Pending ICE candidate error:",
          error
        );
      }
    }

    pendingCandidatesRef.current.delete(
      socketId
    );
  };

  // =====================================================
  // SOCKET + WEBRTC
  // =====================================================

  useEffect(() => {
    if (!meetingId) {
      console.error(
        "Meeting ID is required"
      );

      return;
    }

    let mounted = true;

    const socket = io(
      "https://zoom-clone-wnsp.onrender.com"
    );

    socketRef.current = socket;

    // ===================================================
    // SOCKET CONNECT
    // ===================================================

    socket.on("connect", async () => {
      if (!mounted) {
        return;
      }

      console.log(
        "Socket connected:",
        socket.id
      );

      setConnected(true);

      try {
        await getLocalMedia();

        socket.emit("join-meeting", {
          meetingId,
          role: "PARTICIPANT",
          participantId: null,
        });
      } catch (error) {
        console.error(
          "Camera/microphone error:",
          error
        );
      }
    });

    // ===================================================
    // USER JOINED
    // ===================================================

    socket.on(
      "user-joined",
      async (data) => {
        try {
          const targetSocketId =
            data.socketId;

          console.log(
            "User joined:",
            targetSocketId
          );

          const peerConnection =
            await createPeerConnection(
              targetSocketId
            );

          const offer =
            await peerConnection.createOffer();

          await peerConnection.setLocalDescription(
            offer
          );

          socket.emit("offer", {
            meetingId,
            targetSocketId,
            offer,
          });
        } catch (error) {
          console.error(
            "Create offer error:",
            error
          );
        }
      }
    );

    // ===================================================
    // RECEIVE OFFER
    // ===================================================

    socket.on(
      "offer",
      async (data) => {
        try {
          const senderSocketId =
            data.senderSocketId;

          console.log(
            "Received offer from:",
            senderSocketId
          );

          const peerConnection =
            await createPeerConnection(
              senderSocketId
            );

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(
              data.offer
            )
          );

          await addPendingCandidates(
            senderSocketId,
            peerConnection
          );

          const answer =
            await peerConnection.createAnswer();

          await peerConnection.setLocalDescription(
            answer
          );

          socket.emit("answer", {
            meetingId,
            targetSocketId:
              senderSocketId,
            answer,
          });
        } catch (error) {
          console.error(
            "Offer handling error:",
            error
          );
        }
      }
    );

    // ===================================================
    // RECEIVE ANSWER
    // ===================================================

    socket.on(
      "answer",
      async (data) => {
        try {
          const senderSocketId =
            data.senderSocketId;

          console.log(
            "Received answer from:",
            senderSocketId
          );

          const peerConnection =
            peerConnectionsRef.current.get(
              senderSocketId
            );

          if (!peerConnection) {
            console.warn(
              "Peer connection not found:",
              senderSocketId
            );

            return;
          }

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(
              data.answer
            )
          );

          await addPendingCandidates(
            senderSocketId,
            peerConnection
          );
        } catch (error) {
          console.error(
            "Answer handling error:",
            error
          );
        }
      }
    );

    // ===================================================
    // RECEIVE ICE CANDIDATE
    // ===================================================

    socket.on(
      "ice-candidate",
      async (data) => {
        try {
          const senderSocketId =
            data.senderSocketId;

          const peerConnection =
            peerConnectionsRef.current.get(
              senderSocketId
            );

          if (!peerConnection) {
            return;
          }

          // Remote description is not ready yet.
          if (
            !peerConnection.remoteDescription
          ) {
            const current =
              pendingCandidatesRef.current.get(
                senderSocketId
              ) || [];

            current.push(
              data.candidate
            );

            pendingCandidatesRef.current.set(
              senderSocketId,
              current
            );

            return;
          }

          await peerConnection.addIceCandidate(
            new RTCIceCandidate(
              data.candidate
            )
          );
        } catch (error) {
          console.error(
            "ICE candidate error:",
            error
          );
        }
      }
    );

    // ===================================================
    // USER LEFT
    // ===================================================

    socket.on(
      "user-left",
      (data) => {
        console.log(
          "User left:",
          data.socketId
        );

        removePeerConnection(
          data.socketId
        );
      }
    );

    // ===================================================
    // SOCKET DISCONNECT
    // ===================================================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Socket disconnected"
        );

        setConnected(false);
      }
    );

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      mounted = false;

      socket.off("connect");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
      socket.off("disconnect");

      peerConnectionsRef.current.forEach(
        (peerConnection) => {
          peerConnection.close();
        }
      );

      peerConnectionsRef.current.clear();

      pendingCandidatesRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        localStreamRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          null;
      }

      socket.disconnect();

      socketRef.current = null;
    };
  }, [meetingId]);

  // =====================================================
  // TOGGLE MICROPHONE
  // =====================================================

  const toggleMic = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const audioTrack =
      stream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled =
      !audioTrack.enabled;

    setMicEnabled(
      audioTrack.enabled
    );
  };

  // =====================================================
  // TOGGLE CAMERA
  // =====================================================

  const toggleCamera = () => {
    const stream =
      localStreamRef.current;

    if (!stream) {
      return;
    }

    const videoTrack =
      stream.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    videoTrack.enabled =
      !videoTrack.enabled;

    setCameraEnabled(
      videoTrack.enabled
    );
  };

  // =====================================================
  // LEAVE MEETING
  // =====================================================

  const leaveMeeting = () => {
    if (socketRef.current) {
      socketRef.current.emit(
        "leave-meeting",
        {
          meetingId,
          userId:
            socketRef.current.id,
        }
      );
    }

    peerConnectionsRef.current.forEach(
      (peerConnection) => {
        peerConnection.close();
      }
    );

    peerConnectionsRef.current.clear();

    pendingCandidatesRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject =
        null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setRemoteParticipants([]);
    setConnected(false);
    setInMeeting(false);
  };

  // =====================================================
  // RETURN
  // =====================================================

  return {
    localVideoRef,
    remoteVideoRef,

    connected,

    // New multiple participant data
    remoteParticipants,

    // Keep old value for compatibility
    remoteConnected:
      remoteParticipants.length > 0,

    micEnabled,
    cameraEnabled,
    inMeeting,

    toggleMic,
    toggleCamera,
    leaveMeeting,
  };
};

export default useWebRTC;