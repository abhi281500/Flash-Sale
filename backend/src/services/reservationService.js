import User from "../models/User.models.js";
import Seat from "../models/Seat.models.js";
import redisClient from "../config/redis.js";
import Reservation from "../models/Reservation.models.js";
import Event from "../models/Event.models.js";

export const createReservation = async (eventId, seatId, userId) => {
    console.log("eventId:", eventId);
    console.log("seatId:", seatId);
    console.log("userId:", userId);

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }
    console.log("FOUND USER:", user);
    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }

    const seat = await Seat.findOne({
        _id: seatId,
        eventId: eventId
    });

    if (!seat) {
        throw new Error(
            "Seat not found or does not belong to this event"
        );
    }

    if (seat.status !== "AVAILABLE") {
        throw new Error("Seat is not available");
    }

    const result = await redisClient.set(
        `seat:hold:${seatId}`,
        userId.toString(),
        {
            NX: true,
            EX: 600
        }
    );

    if (!result) {
        throw new Error("Seat is already reserved");
    }

    try {

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        const reservation = await Reservation.create({
            userId,
            eventId,
            seatId,
            status: "ACTIVE",
            expiresAt
        });

        return reservation;

    } catch (error) {

        await redisClient.del(
            `seat:hold:${seatId}`
        );

        throw error;
    }
};