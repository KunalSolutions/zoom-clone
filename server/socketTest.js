import { io } from "socket.io-client";

const socketA = io("http://localhost:5000");
const socketB = io("http://localhost:5000");

socketA.on("connect", () => {
  console.log("A connected:", socketA.id);

  socketA.emit("join-meeting", {
    meetingId: "533008044",
    userId: "user-A",
  });
});

socketB.on("connect", () => {
  console.log("B connected:", socketB.id);

  socketB.emit("join-meeting", {
    meetingId: "533008044",
    userId: "user-B",
  });
});

socketA.on("user-joined", (data) => {
  console.log("A received user-joined:", data);

  socketA.emit("offer", {
    meetingId: "533008044",
    targetSocketId: data.socketId,
    offer: {
      type: "offer",
      sdp: "TEST_WEBRTC_OFFER",
    },
  });
});

socketB.on("offer", (data) => {
  console.log("B received offer:", data);

  socketB.emit("answer", {
    meetingId: "533008044",
    targetSocketId: data.senderSocketId,
    answer: {
      type: "answer",
      sdp: "TEST_WEBRTC_ANSWER",
    },
  });

  socketB.emit("ice-candidate", {
    meetingId: "533008044",
    targetSocketId: data.senderSocketId,
    candidate: {
      candidate: "TEST_ICE_CANDIDATE_B",
    },
  });
});

socketA.on("answer", (data) => {
  console.log("A received answer:", data);

  socketA.emit("ice-candidate", {
    meetingId: "533008044",
    targetSocketId: data.senderSocketId,
    candidate: {
      candidate: "TEST_ICE_CANDIDATE_A",
    },
  });
});

socketA.on("ice-candidate", (data) => {
  console.log("A received ICE candidate:", data);

  socketA.disconnect();
  socketB.disconnect();
});

socketB.on("ice-candidate", (data) => {
  console.log("B received ICE candidate:", data);
});