import express from "express"
import { createEvents ,getEvent ,getSeatsInEvent ,getSeatsInEventById } from "../controllers/eventController.js"

const router = express.Router()

router.post("/", createEvents);

router.get("/:id/seats", getSeatsInEvent);
router.get("/seats/:id", getSeatsInEventById);
router.get("/:id", getEvent);






export default router