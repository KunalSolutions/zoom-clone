import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Check,
  X,
  Copy,
  MessageSquare,
  MonitorUp,
} from "lucide-react";

import socket from "../socket";

import {
  useGetPendingRequestsQuery,
  useAcceptParticipantMutation,
  useRejectParticipantMutation,
} from "../redux/api/meetingParticipantApi";

const MeetingRoom = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [searchParams] = useSearchParams();

  const role =
    searchParams.get("role") || "participant";

  // =========================
  // LOCAL MEDIA
  // =========================

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // =========================
  // WEBRTC
  // =========================

  const peerConnectionsRef = useRef({});

  const pendingCandidatesRef = useRef({});

  const [remoteStreams, setRemoteStreams] =
    useState([]);

  // =========================
  // UI STATE
  // =========================

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [showParticipants, setShowParticipants] =
    useState(true);

  const [error, setError] = useState("");

  const [copied, setCopied] =
    useState(false);

  // =========================
  // ADMIN REQUESTS
  // =========================

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

  const pendingParticipants =
    pendingData?.participants || [];

  // =========================
  // ADD REMOTE STREAM
  // =========================

  const addRemoteStream = (
    socketId,
    stream
  ) => {
    setRemoteStreams((current) => {
      const exists = current.find(
        (item) => item.socketId === socketId
      );

      if (exists) {
        return current.map((item) =>
          item.socketId === socketId
            ? {
              ...item,
              stream,
            }
            : item
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

  // =========================
  // REMOVE REMOTE STREAM
  // =========================

  const removeRemoteStream = (socketId) => {
    setRemoteStreams((current) =>
      current.filter(
        (item) => item.socketId !== socketId
      )
    );
  };

  // =========================
  // CREATE PEER CONNECTION
  // =========================

  const createPeerConnection = (
    targetSocketId
  ) => {
    if (
      peerConnectionsRef.current[
      targetSocketId
      ]
    ) {
      return peerConnectionsRef.current[
        targetSocketId
      ];
    }

    const peerConnection =
      new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

    peerConnectionsRef.current[
      targetSocketId
    ] = peerConnection;

    pendingCandidatesRef.current[
      targetSocketId
    ] = [];

    // =========================
    // ADD LOCAL TRACKS
    // =========================

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          peerConnection.addTrack(
            track,
            streamRef.current
          );
        });
    }

    // =========================
    // REMOTE TRACK
    // =========================

    peerConnection.ontrack = (event) => {
      console.log(
        "REMOTE TRACK RECEIVED:",
        targetSocketId,
        event.streams
      );

      const [remoteStream] = event.streams;

      if (!remoteStream) {
        return;
      }

      console.log(
        "REMOTE STREAM:",
        targetSocketId,
        remoteStream.getTracks()
      );

      addRemoteStream(
        targetSocketId,
        remoteStream
      );
    };

    // =========================
    // ICE CANDIDATE
    // =========================

    peerConnection.onicecandidate = (
      event
    ) => {
      if (!event.candidate) {
        return;
      }

      socket.emit("ice-candidate", {
        targetSocketId,
        candidate: event.candidate,
      });
    };

    // =========================
    // CONNECTION STATE
    // =========================

    peerConnection.onconnectionstatechange =
      () => {
        const state =
          peerConnection.connectionState;

        console.log(
          "WebRTC connection:",
          targetSocketId,
          state
        );

        if (
          state === "failed" ||
          state === "closed" ||
          state === "disconnected"
        ) {
          removeRemoteStream(
            targetSocketId
          );
        }
      };

    return peerConnection;
  };

  // =========================
  // CREATE OFFER
  // =========================

  const createOffer = async (
    targetSocketId
  ) => {
    try {
      const peerConnection =
        createPeerConnection(
          targetSocketId
        );

      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );

      socket.emit("offer", {
        targetSocketId,
        offer,
      });

      console.log(
        "Offer sent:",
        targetSocketId
      );
    } catch (error) {
      console.error(
        "Create offer error:",
        error
      );
    }
  };

  // =========================
  // HANDLE OFFER
  // =========================

  const handleOffer = async ({
    senderSocketId,
    offer,
  }) => {
    try {
      const peerConnection =
        createPeerConnection(
          senderSocketId
        );

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(
          offer
        )
      );

      // Add queued ICE candidates
      const candidates =
        pendingCandidatesRef.current[
        senderSocketId
        ] || [];

      for (const candidate of candidates) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }

      pendingCandidatesRef.current[
        senderSocketId
      ] = [];

      const answer =
        await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        answer
      );

      socket.emit("answer", {
        targetSocketId: senderSocketId,
        answer,
      });

      console.log(
        "Answer sent:",
        senderSocketId
      );
    } catch (error) {
      console.error(
        "Handle offer error:",
        error
      );
    }
  };

  // =========================
  // HANDLE ANSWER
  // =========================

  const handleAnswer = async ({
    senderSocketId,
    answer,
  }) => {
    try {
      const peerConnection =
        peerConnectionsRef.current[
        senderSocketId
        ];

      if (!peerConnection) {
        return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(
          answer
        )
      );

      // Add queued ICE candidates
      const candidates =
        pendingCandidatesRef.current[
        senderSocketId
        ] || [];

      for (const candidate of candidates) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }

      pendingCandidatesRef.current[
        senderSocketId
      ] = [];

      console.log(
        "Answer received:",
        senderSocketId
      );
    } catch (error) {
      console.error(
        "Handle answer error:",
        error
      );
    }
  };

  // =========================
  // HANDLE ICE
  // =========================

  const handleIceCandidate = async ({
    senderSocketId,
    candidate,
  }) => {
    try {
      const peerConnection =
        peerConnectionsRef.current[
        senderSocketId
        ];

      if (!peerConnection) {
        return;
      }

      if (
        peerConnection.remoteDescription
      ) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        if (
          !pendingCandidatesRef.current[
          senderSocketId
          ]
        ) {
          pendingCandidatesRef.current[
            senderSocketId
          ] = [];
        }

        pendingCandidatesRef.current[
          senderSocketId
        ].push(candidate);
      }
    } catch (error) {
      console.error(
        "ICE candidate error:",
        error
      );
    }
  };

  // =========================
  // CLOSE PEER
  // =========================

  const closePeerConnection = (
    socketId
  ) => {
    const peerConnection =
      peerConnectionsRef.current[
      socketId
      ];

    if (peerConnection) {
      peerConnection.close();
    }

    delete peerConnectionsRef.current[
      socketId
    ];

    delete pendingCandidatesRef.current[
      socketId
    ];

    removeRemoteStream(socketId);
  };

  // =========================
  // CAMERA + MICROPHONE
  // =========================

  useEffect(() => {
    let mounted = true;

    const startMedia = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;
        }

        // =========================
        // CONNECT SOCKET
        // =========================

        if (!socket.connected) {
          socket.connect();
        }

        socket.emit("join-meeting", {
          meetingId,
          role,
          participantId:
            searchParams.get(
              "participantId"
            ) || null,
        });
      } catch (error) {
        console.error(
          "Camera/microphone error:",
          error
        );

        setError(
          "Camera or microphone permission is required to join the meeting."
        );
      }
    };

    startMedia();

    return () => {
      mounted = false;
    };
  }, [meetingId, role]);

  // =========================
  // SOCKET + WEBRTC EVENTS
  // =========================

  useEffect(() => {
    // =========================
    // EXISTING USERS
    // =========================

    const handleExistingUsers = (
      users
    ) => {
      console.log(
        "Existing users:",
        users
      );

      // New user creates offers
      // to everyone already inside.
      users.forEach((user) => {
        createOffer(user.socketId);
      });
    };

    // =========================
    // NEW USER JOINED
    // =========================

    const handleUserJoined = ({
      socketId,
      role: userRole,
      participantId,
    }) => {
      console.log(
        "User joined:",
        socketId,
        userRole,
        participantId
      );

      // Existing users do nothing here.
      // The newly joined user will send
      // offers using existing-users.
    };

    // =========================
    // OFFER
    // =========================

    const handleOfferEvent = (data) => {
      handleOffer(data);
    };

    // =========================
    // ANSWER
    // =========================

    const handleAnswerEvent = (data) => {
      handleAnswer(data);
    };

    // =========================
    // ICE
    // =========================

    const handleIceEvent = (data) => {
      handleIceCandidate(data);
    };

    // =========================
    // USER LEFT
    // =========================

    const handleUserLeft = ({
      socketId,
    }) => {
      console.log(
        "User left:",
        socketId
      );

      closePeerConnection(socketId);
    };

    socket.on(
      "existing-users",
      handleExistingUsers
    );

    socket.on(
      "user-joined",
      handleUserJoined
    );

    socket.on(
      "offer",
      handleOfferEvent
    );

    socket.on(
      "answer",
      handleAnswerEvent
    );

    socket.on(
      "ice-candidate",
      handleIceEvent
    );

    socket.on(
      "user-left",
      handleUserLeft
    );

    return () => {
      socket.off(
        "existing-users",
        handleExistingUsers
      );

      socket.off(
        "user-joined",
        handleUserJoined
      );

      socket.off(
        "offer",
        handleOfferEvent
      );

      socket.off(
        "answer",
        handleAnswerEvent
      );

      socket.off(
        "ice-candidate",
        handleIceEvent
      );

      socket.off(
        "user-left",
        handleUserLeft
      );
    };
  }, []);

  // =========================
  // MIC
  // =========================

  const toggleMic = () => {
    if (!streamRef.current) {
      return;
    }

    const audioTrack =
      streamRef.current.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled =
      !audioTrack.enabled;

    setMicEnabled(
      audioTrack.enabled
    );
  };

  // =========================
  // CAMERA
  // =========================

  const toggleCamera = () => {
    if (!streamRef.current) {
      return;
    }

    const videoTrack =
      streamRef.current.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    videoTrack.enabled =
      !videoTrack.enabled;

    setCameraEnabled(
      videoTrack.enabled
    );
  };

  // =========================
  // ACCEPT
  // =========================

  const handleAccept = async (
    participantId
  ) => {
    try {
      await acceptParticipant(
        participantId
      ).unwrap();

      refetchPending();
    } catch (error) {
      console.error(
        "Accept participant error:",
        error
      );
    }
  };

  // =========================
  // REJECT
  // =========================

  const handleReject = async (
    participantId
  ) => {
    try {
      await rejectParticipant(
        participantId
      ).unwrap();

      refetchPending();
    } catch (error) {
      console.error(
        "Reject participant error:",
        error
      );
    }
  };

  // =========================
  // COPY MEETING ID
  // =========================

  const copyMeetingCode = async () => {
    try {
      await navigator.clipboard.writeText(
        meetingId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  };

  // =========================
  // LEAVE
  // =========================

  const leaveMeeting = () => {
    socket.emit("leave-meeting", {
      meetingId,
    });

    Object.keys(
      peerConnectionsRef.current
    ).forEach((socketId) => {
      closePeerConnection(socketId);
    });

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    socket.disconnect();

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  // =========================
  // ERROR SCREEN
  // =========================

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-red-950 flex items-center justify-center mx-auto">
            <VideoOff
              size={30}
              className="text-red-500"
            />
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Camera Access Required
          </h1>

          <p className="mt-3 text-zinc-400">
            {error}
          </p>

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

  // =========================
  // VIDEO GRID
  // =========================

  const totalVideos =
    remoteStreams.length + 1;

  let gridClass =
    "grid-cols-1";

  if (totalVideos === 2) {
    gridClass =
      "grid-cols-1 md:grid-cols-2";
  }

  if (totalVideos >= 3) {
    gridClass =
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      {/* =========================
          HEADER
      ========================= */}

      <header className="h-16 shrink-0 border-b border-zinc-800 bg-[#181818] px-5 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold">
              Z
            </span>
          </div>

          <div>
            <span className="text-lg font-semibold">
              ZoomLite
            </span>

            <div className="hidden sm:block text-xs text-zinc-500">
              {role === "admin"
                ? "Host"
                : "Participant"}
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

              {copied
                ? "Copied"
                : "Share Code"}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setShowParticipants(
                !showParticipants
              )
            }
            className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition flex items-center justify-center"
          >
            <Users size={18} />
          </button>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="flex-1 min-h-0 flex">
        {/* =========================
            VIDEO AREA
        ========================= */}

        <section
          className={`flex-1 min-w-0 p-4 md:p-6 ${showParticipants &&
              role === "admin"
              ? ""
              : "w-full"
            }`}
        >
          <div
            className={`h-full min-h-[calc(100vh-160px)] grid ${gridClass} gap-4`}
          >
            {/* =========================
                LOCAL VIDEO
            ========================= */}

            <div className="relative min-h-[300px] rounded-2xl overflow-hidden bg-black border border-zinc-800">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${cameraEnabled
                    ? ""
                    : "opacity-0"
                  }`}
              />

              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-semibold">
                    {role === "admin"
                      ? "A"
                      : "U"}
                  </div>
                </div>
              )}

              <div className="absolute left-4 bottom-4 bg-black/70 rounded-lg px-3 py-1.5 text-sm">
                {role === "admin"
                  ? "You · Host"
                  : "You"}
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

            {/* =========================
                REMOTE VIDEOS
            ========================= */}

            {remoteStreams.map(
              (remote) => (
                <RemoteVideo
                  key={remote.socketId}
                  stream={remote.stream}
                  socketId={
                    remote.socketId
                  }
                />
              )
            )}

            {/* =========================
                EMPTY STATE
            ========================= */}

            {remoteStreams.length ===
              0 && (
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
                        Accept users to let
                        them join
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* =========================
            ADMIN REQUEST PANEL
        ========================= */}

        {role === "admin" &&
          showParticipants && (
            <aside className="w-full md:w-80 lg:w-96 shrink-0 border-l border-zinc-800 bg-[#181818] flex flex-col">
              <div className="h-16 px-5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Join Requests
                  </h2>

                  <p className="text-xs text-zinc-500 mt-1">
                    Waiting for approval
                  </p>
                </div>

                <div className="h-7 min-w-7 px-2 rounded-full bg-yellow-950 text-yellow-400 flex items-center justify-center text-xs font-semibold">
                  {pendingData?.count ||
                    0}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {pendingLoading ? (
                  <div className="py-10 text-center">
                    <div className="h-7 w-7 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto" />

                    <p className="mt-3 text-sm text-zinc-500">
                      Checking requests...
                    </p>
                  </div>
                ) : pendingParticipants.length ===
                  0 ? (
                  <div className="py-16 text-center">
                    <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">
                      <Users
                        size={24}
                        className="text-zinc-600"
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-medium">
                      No join requests
                    </h3>

                    <p className="mt-2 text-xs text-zinc-600">
                      New requests will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingParticipants.map(
                      (participant) => (
                        <div
                          key={
                            participant._id
                          }
                          className="rounded-xl border border-zinc-800 bg-[#111111] p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                              <span className="font-semibold">
                                {participant.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {
                                  participant.name
                                }
                              </p>

                              <p className="text-xs text-yellow-500 mt-1">
                                Wants to join
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                              type="button"
                              disabled={
                                accepting ||
                                rejecting
                              }
                              onClick={() =>
                                handleAccept(
                                  participant._id
                                )
                              }
                              className="h-9 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <Check
                                size={16}
                              />
                              Accept
                            </button>

                            <button
                              type="button"
                              disabled={
                                accepting ||
                                rejecting
                              }
                              onClick={() =>
                                handleReject(
                                  participant._id
                                )
                              }
                              className="h-9 rounded-lg bg-zinc-800 hover:bg-red-950 hover:text-red-400 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </aside>
          )}
      </main>

      {/* =========================
          CONTROLS
      ========================= */}

      <footer className="h-20 shrink-0 border-t border-zinc-800 bg-[#181818] flex items-center justify-center gap-3 px-4">
        <button
          type="button"
          onClick={toggleMic}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition ${micEnabled
              ? "bg-zinc-800 hover:bg-zinc-700"
              : "bg-red-600 hover:bg-red-700"
            }`}
          title={
            micEnabled
              ? "Mute"
              : "Unmute"
          }
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
          className={`h-12 w-12 rounded-full flex items-center justify-center transition ${cameraEnabled
              ? "bg-zinc-800 hover:bg-zinc-700"
              : "bg-red-600 hover:bg-red-700"
            }`}
          title={
            cameraEnabled
              ? "Turn camera off"
              : "Turn camera on"
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
          className="hidden sm:flex h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 items-center justify-center transition"
          title="Chat"
        >
          <MessageSquare size={20} />
        </button>

        <button
          type="button"
          className="hidden sm:flex h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 items-center justify-center transition"
          title="Share screen"
        >
          <MonitorUp size={20} />
        </button>

        <button
          type="button"
          onClick={leaveMeeting}
          className="h-12 px-5 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center gap-2 font-medium ml-3"
        >
          <PhoneOff size={19} />

          <span className="hidden sm:inline">
            Leave
          </span>
        </button>
      </footer>
    </div>
  );
};

// =========================
// REMOTE VIDEO COMPONENT
// =========================

const RemoteVideo = ({
  stream,
  socketId,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject =
        stream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
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

export default MeetingRoom;