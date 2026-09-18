import mongoose from "mongoose";
import Payment from "../models/Payment.models.js"
import Reservation from "../models/Reservation.models.js";
import Seat from "../models/Seat.models.js";
import redisClient from "../config/redis.js";
import Booking from "../models/Booking.models.js";


export const finalizeBooking = async (paymentId) => {

    // 1. Find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.status !== "SUCCESS") {
        throw new Error("Payment is not successful");
    }


    // 2. Find reservation
    const reservation = await Reservation.findOne({
        _id: payment.reservationId,
        userId: payment.userId
    });

    if (!reservation) {
        throw new Error("Reservation not found");
    }


    // 3. Check reservation status
    if (reservation.status !== "ACTIVE") {
        throw new Error("Reservation is not active");
    }


    // 4. Check expiry
    if (reservation.expiresAt < new Date()) {
        throw new Error("Reservation has expired");
    }


    // 5. Find seat
    const seat = await Seat.findById(reservation.seatId);

    if (!seat) {
        throw new Error("Seat not found");
    }


    // 6. Check Redis hold
    const holdKey = `seat:hold:${reservation.seatId}`;

    const holdOwner = await redisClient.get(holdKey);

    if (!holdOwner) {
        throw new Error("Seat hold has expired");
    }

    if (holdOwner !== payment.userId.toString()) {
        throw new Error("Seat is held by another user");
    }


    // 7. Start transaction
    const session = await mongoose.startSession();

    try {

        session.startTransaction();


        // 8. AVAILABLE → BOOKED
        const updatedSeat = await Seat.findOneAndUpdate(
            {
                _id: reservation.seatId,
                status: "AVAILABLE"
            },
            {
                $set: {
                    status: "BOOKED"
                },
                $inc: {
                    version: 1
                }
            },
            {
                session,
                new: true
            }
        );


        if (!updatedSeat) {
            throw new Error("Seat is no longer available");
        }


        // 9. Create Booking
        const bookingReference =
            `BK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const [booking] = await Booking.create(
            [
                {
                    userId: payment.userId,
                    eventId: reservation.eventId,
                    reservationId: reservation._id,

                    bookingReference,

                    totalAmount: payment.amount,

                    status: "CONFIRMED"
                }
            ],
            {
                session
            }
        );


        // 10. ACTIVE → CONVERTED
        const convertedReservation =
            await Reservation.findOneAndUpdate(
                {
                    _id: reservation._id,
                    status: "ACTIVE"
                },
                {
                    $set: {
                        status: "CONVERTED"
                    }
                },
                {
                    session,
                    new: true
                }
            );


        if (!convertedReservation) {
            throw new Error("Reservation is no longer active");
        }


        // 11. Payment → Booking
        await Payment.findOneAndUpdate(
            {
                _id: payment._id,
                status: "SUCCESS"
            },
            {
                $set: {
                    bookingId: booking._id
                }
            },
            {
                session,
                new: true
            }
        );


        // 12. Commit
        await session.commitTransaction();


        // 13. Remove Redis hold
        await redisClient.del(holdKey);


        // 14. Return booking
        return booking;

    } catch (error) {

        console.log("Finalize Booking error", error);

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();
    }
};


