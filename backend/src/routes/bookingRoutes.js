import express from "express";

import {
    finalizeBookings
} from "../controllers/bookingController.js";


const router = express.Router();


router.post("/", finalizeBookings);


export default router;