import Meeting from "../models/Meeting.js";
import MeetingParticipant from "../models/MeetingParticipant.js";

export const requestToJoinMeeting = async (req, res) => {
  try {
    const { name, meetingCode } = req.body;

    if (!name || !meetingCode) {
      return res.status(400).json({
        success: false,
        message: "Name and meeting code are required",
      });
    }

    const meeting = await Meeting.findOne({
      meetingCode,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (meeting.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Meeting has expired",
      });
    }

    const participant = await MeetingParticipant.create({
      meetingId: meeting._id,
      name,
      status: "WAITING",
    });

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully",
      participant: {
        id: participant._id,
        name: participant.name,
        status: participant.status,
        meetingId: participant.meetingId,
      },
    });
  } catch (error) {
    console.error("Request to join meeting error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send join request",
    });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      hostId: req.adminId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const participants = await MeetingParticipant.find({
      meetingId,
      status: "WAITING",
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      count: participants.length,
      participants,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get pending requests",
    });
  }
};

export const acceptParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;

    const participant = await MeetingParticipant.findById(
      participantId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant request not found",
      });
    }

    const meeting = await Meeting.findOne({
      _id: participant.meetingId,
      hostId: req.adminId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (meeting.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Meeting has expired",
      });
    }

    if (participant.status !== "WAITING") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    participant.status = "ACCEPTED";
    participant.joinedAt = new Date();

    await participant.save();

    return res.json({
      success: true,
      message: "Participant accepted successfully",
      participant,
    });
  } catch (error) {
    console.error("Accept participant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept participant",
    });
  }
};

export const rejectParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;

    const participant = await MeetingParticipant.findById(
      participantId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant request not found",
      });
    }

    const meeting = await Meeting.findOne({
      _id: participant.meetingId,
      hostId: req.adminId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (participant.status !== "WAITING") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    participant.status = "REJECTED";

    await participant.save();

    return res.json({
      success: true,
      message: "Participant rejected successfully",
      participant,
    });
  } catch (error) {
    console.error("Reject participant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject participant",
    });
  }
};

export const getParticipantStatus = async (req, res) => {
  try {
    const { participantId } = req.params;

    const participant = await MeetingParticipant.findById(
      participantId
    ).select("name status meetingId joinedAt leftAt");

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    return res.json({
      success: true,
      participant,
    });
  } catch (error) {
    console.error("Get participant status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get participant status",
    });
  }
};