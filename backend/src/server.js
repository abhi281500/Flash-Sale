import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";
import redisClient from "./config/redis.js";
import { startReservationExpiryWorker } from "./workers/reservationExpiry.worker.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        await redisClient.connect();

        const response = await redisClient.ping();

        console.log("Redis:", response);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
startReservationExpiryWorker();