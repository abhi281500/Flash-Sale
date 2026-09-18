import {
    createPayment,
    processMockPayment
} from "../services/paymentService.js";


export const createPayments = async (req, res) => {

    try {

        const { reservationId, userId } = req.body;

        const idempotencyKey =
            req.headers["idempotency-key"];


        if (!reservationId || !userId) {

            return res.status(400).json({
                success: false,
                message: "reservationId and userId are required"
            });
        }


        if (!idempotencyKey) {

            return res.status(400).json({
                success: false,
                message: "Idempotency-Key header is required"
            });
        }


        const payment = await createPayment(
            reservationId,
            userId,
            idempotencyKey
        );


        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const createprocessMockPayments = async (req, res) => {

    try {

        const { paymentId } = req.body;

        if (!paymentId) {

            return res.status(400).json({
                success: false,
                message: "paymentId is required"
            });
        }


        const payment =
            await processMockPayment(paymentId);


        return res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            payment
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};