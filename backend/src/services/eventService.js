import mongoose from "mongoose";
import Event from "../models/Event.models.js";
import Seat from "../models/Seat.models.js";
import redisClient from "../config/redis.js";

export const createEvent = async (eventdata) => {
    const {
        name,
        description,
        venue,
        startTime,
        endTime,
        totalSeats,
        status
    } = eventdata;


    if (
        !name ||
        !description ||
        !venue ||
        !startTime ||
        !endTime ||
        !totalSeats ||
        totalSeats <= 0
    ) {
        throw new Error("Required fields missing or invalid");
    }

    const session = await mongoose.startSession();

    try {

        session.startTransaction();


        const [event] = await Event.create(
            [
                {
                    name,
                    description,
                    venue,
                    startTime,
                    endTime,
                    totalSeats,
                    status
                }
            ],
            { session }
        );

        const eventId = event._id;


        const seats = [];

        for (let i = 0; i < totalSeats; i++) {
            const row = String.fromCharCode(
                65 + Math.floor(i / 10)
            );

            const seatNumber = (i % 10) + 1;

            seats.push({
                eventId,
                seatNumber: `${row}${seatNumber}`,
                row,
                price: 500,
                status: "AVAILABLE",
                version: 0
            });
        }


        const createdSeats = await Seat.insertMany(
            seats,
            { session }
        );


        await session.commitTransaction();


        return {
            event,
            seats: createdSeats
        };

    } catch (error) {


        await session.abortTransaction();

        throw error;

    } finally {


        await session.endSession();
    }
};




export const getEventById = async (eventId) => {


    const cachedEvent = await redisClient.get(`event:${eventId}`);

    if (cachedEvent) {
        console.log("Event found in Redis");

        return JSON.parse(cachedEvent);
    }



    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }


    await redisClient.set(
        `event:${eventId}`,
        JSON.stringify(event)
    );


    return event;
};


export const getEventSeats = async (eventId) => {


    const cachedSeats = await redisClient.get(
        `event:seats:${eventId}`
    );

    if (cachedSeats) {
        console.log("Seats found in Redis");

        return JSON.parse(cachedSeats);
    }


    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Event not found");
    }


    const seats = await Seat.find({ eventId });

    if (seats.length === 0) {
        throw new Error("No seats are present");
    }


    await redisClient.set(
        `event:seats:${eventId}`,
        JSON.stringify(seats)
    );


    return seats;
};


export const getSeatById = async (seatId) => {

    const cachedSeat = await redisClient.get(
        `seat:${seatId}`
    );

    if (cachedSeat) {
        console.log("Seat found in Redis");

        return JSON.parse(cachedSeat);
    }

    const seat = await Seat.findById(seatId);

    if (!seat) {
        throw new Error("Seat not found");
    }

    await redisClient.set(
        `seat:${seatId}`,
        JSON.stringify(seat)
    );

    return seat;
};


