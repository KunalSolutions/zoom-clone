import mongoose from "mongoose";

const meetingParticipantSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["WAITING", "ACCEPTED", "REJECTED"],
      default: "WAITING",
    },

    joinedAt: {
      type: Date,
      default: null,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MeetingParticipant = mongoose.model(
  "MeetingParticipant",
  meetingParticipantSchema
);

export default MeetingParticipant;