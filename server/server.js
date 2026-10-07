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

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/meetings", meetingRoutes);
app.use(
  "/api/v1/meeting-participants",
  meetingParticipantRoutes
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Zoom Clone API is running",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // =========================
  // JOIN MEETING
  // =========================

  socket.on(
    "join-meeting",
    ({ meetingId, role, participantId }) => {
      const room = io.sockets.adapter.rooms.get(meetingId);

      const existingUsers = room
        ? [...room].map((socketId) => {
            const existingSocket =
              io.sockets.sockets.get(socketId);

            return {
              socketId,
              role: existingSocket?.data?.role || "participant",
              participantId:
                existingSocket?.data?.participantId || null,
            };
          })
        : [];

      socket.join(meetingId);

      socket.data.meetingId = meetingId;
      socket.data.role = role;
      socket.data.participantId =
        participantId || null;

      // Send existing users to the newly joined user
      socket.emit("existing-users", existingUsers);

      // Tell existing users about the new user
      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
        role,
        participantId: participantId || null,
      });

      console.log(
        `${role} joined meeting: ${meetingId}`
      );

      console.log(
        "Existing users:",
        existingUsers.map(
          (user) => user.socketId
        )
      );
    }
  );

  // =========================
  // JOIN REQUEST
  // =========================

  socket.on(
    "join-request",
    ({
      meetingId,
      participantId,
      name,
    }) => {
      socket.to(meetingId).emit(
        "new-join-request",
        {
          participantId,
          name,
        }
      );

      console.log(
        `${name} requested to join meeting ${meetingId}`
      );
    }
  );

  // =========================
  // ACCEPT REQUEST
  // =========================

  socket.on(
    "request-accepted",
    ({
      targetSocketId,
      participantId,
    }) => {
      io.to(targetSocketId).emit(
        "request-accepted",
        {
          participantId,
        }
      );
    }
  );

  // =========================
  // REJECT REQUEST
  // =========================

  socket.on(
    "request-rejected",
    ({
      targetSocketId,
      participantId,
    }) => {
      io.to(targetSocketId).emit(
        "request-rejected",
        {
          participantId,
        }
      );
    }
  );

  // =========================
  // WEBRTC OFFER
  // =========================

  socket.on(
    "offer",
    ({
      targetSocketId,
      offer,
    }) => {
      io.to(targetSocketId).emit(
        "offer",
        {
          senderSocketId: socket.id,
          offer,
        }
      );
    }
  );

  // =========================
  // WEBRTC ANSWER
  // =========================

  socket.on(
    "answer",
    ({
      targetSocketId,
      answer,
    }) => {
      io.to(targetSocketId).emit(
        "answer",
        {
          senderSocketId: socket.id,
          answer,
        }
      );
    }
  );

  // =========================
  // ICE CANDIDATE
  // =========================

  socket.on(
    "ice-candidate",
    ({
      targetSocketId,
      candidate,
    }) => {
      io.to(targetSocketId).emit(
        "ice-candidate",
        {
          senderSocketId: socket.id,
          candidate,
        }
      );
    }
  );

  // =========================
  // LEAVE
  // =========================

  socket.on(
    "leave-meeting",
    ({ meetingId }) => {
      socket.to(meetingId).emit(
        "user-left",
        {
          socketId: socket.id,
        }
      );

      socket.leave(meetingId);
    }
  );

  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    if (socket.data.meetingId) {
      socket
        .to(socket.data.meetingId)
        .emit("user-left", {
          socketId: socket.id,
        });
    }
  });
});

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});