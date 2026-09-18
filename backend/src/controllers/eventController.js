import { createEvent ,getEventById,getEventSeats ,getSeatById} from "../services/eventService.js";

export const createEvents = async (req, res) => {
    try {
        const event = await createEvent(req.body);

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getEvent = async (req, res) => {
    try {
        const event = await getEventById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Event Retrieved Successfully",
            event
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


export const getSeatsInEvent = async (req, res) => {
    try {
        const seats = await getEventSeats(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Seats Retrieved Successfully",
            seats
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


export const getSeatsInEventById = async (req, res) => {
    try {
        const seat = await getSeatById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Seat Retrieved Successfully",
            seat
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

