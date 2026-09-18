
import { finalizeBooking } from "../services/bookingService.js";


export const finalizeBookings = async (req, res) => {

    try {

        const { paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "paymentId is required"
            });
        }

        const booking = await finalizeBooking(paymentId);

        return res.status(201).json({
            success: true,
            message: "Booking confirmed successfully",
            booking
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};