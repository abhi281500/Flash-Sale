import crypto from "crypto";
import redisClient from "../config/redis.js";
import User from "../models/User.models.js";
import Reservation from "../models/Reservation.models.js";
import Seat from "../models/Seat.models.js";
import Payment from "../models/Payment.models.js";
import IdempotencyKey from "../models/IdempotenyKey.models.js"


export const createPayment = async (
    reservationId,
    userId,
    idempotencyKey
) => {

    // 1. Check user
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }


    // 2. Create request hash
    const requestData = JSON.stringify({
        reservationId: reservationId.toString(),
        userId: userId.toString()
    });

    const requestHash = crypto
        .createHash("sha256")
        .update(requestData)
        .digest("hex");


    // 3. Check existing idempotency key
    const existingKey = await IdempotencyKey.findOne({
        key: idempotencyKey,
        userId
    });

    if (existingKey) {

        // Same key but different request
        if (existingKey.requestHash !== requestHash) {
            throw new Error(
                "Idempotency key was already used for a different request"
            );
        }

        // Same request already completed
        if (existingKey.status === "COMPLETED") {
            return existingKey.response;
        }

        // Same request currently processing
        if (existingKey.status === "PROCESSING") {
            throw new Error(
                "Payment request is already processing"
            );
        }

        // Previous request failed
        if (existingKey.status === "FAILED") {
            throw new Error(
                "Previous payment request failed"
            );
        }
    }


    // 4. Find reservation
    const reservation = await Reservation.findOne({
        _id: reservationId,
        userId
    });

    if (!reservation) {
        throw new Error("Reservation not found");
    }


    // 5. Reservation must be active
    if (reservation.status !== "ACTIVE") {
        throw new Error("Reservation is not active");
    }


    // 6. Check reservation expiry
    if (reservation.expiresAt < new Date()) {
        throw new Error("Reservation has expired");
    }


    // 7. Find seat
    const seat = await Seat.findById(reservation.seatId);

    if (!seat) {
        throw new Error("Seat not found");
    }


    // 8. Check Redis hold
    const holdKey = `seat:hold:${reservation.seatId}`;

    const holdOwner = await redisClient.get(holdKey);

    if (!holdOwner) {
        throw new Error("Seat hold has expired");
    }

    if (holdOwner !== userId.toString()) {
        throw new Error("Seat is held by another user");
    }


    // 9. Create idempotency record
    try {

        await IdempotencyKey.create({
            key: idempotencyKey,
            userId,
            requestHash,
            status: "PROCESSING",
            expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )
        });

    } catch (error) {

        // Concurrent request created same key
        if (error.code === 11000) {

            const existingKey = await IdempotencyKey.findOne({
                key: idempotencyKey,
                userId
            });

            if (!existingKey) {
                throw error;
            }

            if (existingKey.requestHash !== requestHash) {
                throw new Error(
                    "Idempotency key was already used for a different request"
                );
            }

            if (existingKey.status === "COMPLETED") {
                return existingKey.response;
            }

            throw new Error(
                "Payment request is already processing"
            );
        }

        throw error;
    }


    // 10. Create pending payment
    try {

        const payment = await Payment.create({
            userId,
            reservationId,

            // bookingId intentionally NOT provided
            // because booking will be created
            // after successful payment

            amount: seat.price,
            currency: "INR",
            provider: "MOCK",
            status: "PENDING",
            idempotencyKey
        });


        // 11. Mark idempotency request completed
        await IdempotencyKey.findOneAndUpdate(
            {
                key: idempotencyKey,
                userId
            },
            {
                $set: {
                    status: "COMPLETED",
                    response: payment
                }
            }
        );


        return payment;

    } catch (error) {

        // Payment creation failed
        await IdempotencyKey.findOneAndUpdate(
            {
                key: idempotencyKey,
                userId
            },
            {
                $set: {
                    status: "FAILED"
                }
            }
        );

        throw error;
    }
};




export const processMockPayment = async (paymentId) => {

    // 1. Find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error("Payment not found");
    }

    // 2. Payment must be pending
    if (payment.status !== "PENDING") {
        throw new Error("Payment is already processed");
    }

    // 3. Mock payment result
    const isSuccess = Math.random() < 0.8;

    // 4. Payment failed
    if (!isSuccess) {
        payment.status = "FAILED";

        await payment.save();

        return payment;
    }

    // 5. Payment successful
    payment.status = "SUCCESS";

    payment.providerTransactionId =
        `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    await payment.save();

    return payment;
};