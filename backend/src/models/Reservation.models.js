import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED", "CONVERTED"],
      default: "ACTIVE",
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Reservation = mongoose.model("Reservation", ReservationSchema);

export default Reservation;