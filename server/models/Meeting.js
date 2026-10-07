import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    meetingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Meeting = mongoose.model(
  "Meeting",
  meetingSchema
);

export default Meeting;