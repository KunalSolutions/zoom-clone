import Meeting from "../models/Meeting.js";

const generateMeetingCode = () => {
  return Math.floor(
    100000000 + Math.random() * 900000000
  ).toString();
};

export const createMeeting = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Meeting name is required",
      });
    }

    let meetingCode;
    let existingMeeting;

    do {
      meetingCode = generateMeetingCode();

      existingMeeting = await Meeting.findOne({
        meetingCode,
      });
    } while (existingMeeting);

    const meeting = await Meeting.create({
      name,
      meetingCode,
      hostId: req.adminId,
    });

    return res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting,
    });
  } catch (error) {
    console.error("Create meeting error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create meeting",
    });
  }
};

export const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      hostId: req.adminId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: meetings.length,
      meetings,
    });
  } catch (error) {
    console.error("Get meetings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get meetings",
    });
  }
};

export const expireMeeting = async (req, res) => {
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

    if (meeting.status === "EXPIRED") {
      return res.status(400).json({
        success: false,
        message: "Meeting is already expired",
      });
    }

    meeting.status = "EXPIRED";
    meeting.endedAt = new Date();

    await meeting.save();

    return res.json({
      success: true,
      message: "Meeting expired successfully",
      meeting,
    });
  } catch (error) {
    console.error("Expire meeting error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to expire meeting",
    });
  }
};