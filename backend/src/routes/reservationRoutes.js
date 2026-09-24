import express, { Router } from "express"
import { createReservations } from "../controllers/reservationController.js"
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router  = express.Router()


router.post(
    "/",
    authMiddleware,
    rateLimiter({
        limit: 10,
        windowSeconds: 60
    }),
    createReservations
);

export  default router 