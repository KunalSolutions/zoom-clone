import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createMeeting,
  getMyMeetings,
  expireMeeting,
} from "../controllers/meetingController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createMeeting
);

router.get(
  "/",
  authMiddleware,
  getMyMeetings
);

router.patch(
  "/:meetingId/expire",
  authMiddleware,
  expireMeeting
);

export default router;