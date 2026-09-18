import { createReservation } from "../services/reservationService.js";

export const createReservations = async (req, res) => {
    try {

        const { eventId, seatId, userId } = req.body;

        const reservation = await createReservation(
            eventId,
            seatId,
            userId
        );

        return res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            reservation
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
