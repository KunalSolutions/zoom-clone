import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./db.js";

import adminRoutes from "./routes/adminRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import meetingParticipantRoutes from "./routes/meetingParticipantRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://avsi-workspace.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/meetings", meetingRoutes);
app.use("/api/v1/meeting-participants", meetingParticipantRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Zoom Clone API is running",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-meeting", ({ meetingId, role, participantId }) => {
    if (!meetingId) return;

    const room = io.sockets.adapter.rooms.get(meetingId);

    const existingUsers = room
      ? [...room].map((socketId) => {
          const existingSocket = io.sockets.sockets.get(socketId);

          return {
            socketId,
            role: existingSocket?.data?.role || "participant",
            participantId: existingSocket?.data?.participantId || null,
          };
        })
      : [];

    socket.join(meetingId);

    socket.data.meetingId = meetingId;
    socket.data.role = role;
    socket.data.participantId = participantId || null;

    socket.emit("existing-users", existingUsers);

    socket.to(meetingId).emit("user-joined", {
      socketId: socket.id,
      role,
      participantId: participantId || null,
    });

    console.log(`${role} joined meeting: ${meetingId}`);
    console.log("Existing users:", existingUsers.map((user) => user.socketId));
  });

  socket.on("join-request", ({ meetingId, participantId, name }) => {
    if (!meetingId) return;

    socket.to(meetingId).emit("new-join-request", {
      participantId,
      name,
    });

    console.log(`${name} requested to join meeting ${meetingId}`);
  });

  socket.on("request-accepted", ({ targetSocketId, participantId }) => {
    io.to(targetSocketId).emit("request-accepted", {
      participantId,
    });
  });

  socket.on("request-rejected", ({ targetSocketId, participantId }) => {
    io.to(targetSocketId).emit("request-rejected", {
      participantId,
    });
  });

  socket.on("offer", ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit("offer", {
      senderSocketId: socket.id,
      offer,
    });
  });

  socket.on("answer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("answer", {
      senderSocketId: socket.id,
      answer,
    });
  });

  socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("ice-candidate", {
      senderSocketId: socket.id,
      candidate,
    });
  });

  socket.on("leave-meeting", ({ meetingId }) => {
    if (!meetingId) return;

    socket.to(meetingId).emit("user-left", {
      socketId: socket.id,
    });

    socket.leave(meetingId);
    socket.data.meetingId = null;
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    if (socket.data.meetingId) {
      socket.to(socket.data.meetingId).emit("user-left", {
        socketId: socket.id,
      });
    }
  });
});

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});