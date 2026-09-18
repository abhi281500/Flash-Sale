import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },

    row: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "HELD", "BOOKED"],
      default: "AVAILABLE",
    },

    version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Seat = mongoose.model("Seat", SeatSchema);

export default Seat;