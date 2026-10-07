import express from "express";

import {
  requestToJoinMeeting,
  getPendingRequests,
  acceptParticipant,
  rejectParticipant,
  getParticipantStatus,
} from "../controllers/meetingParticipantController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/join",
  requestToJoinMeeting
);

router.get(
  "/:meetingId/pending",
  authMiddleware,
  getPendingRequests
);

router.patch(
  "/:participantId/accept",
  authMiddleware,
  acceptParticipant
);

router.patch(
  "/:participantId/reject",
  authMiddleware,
  rejectParticipant
);

router.get(
  "/:participantId/status",
  getParticipantStatus
);

export default router;