import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;