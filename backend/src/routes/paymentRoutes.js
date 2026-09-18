import express from "express";

import {
    createPayments,
    createprocessMockPayments
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", createPayments);

router.post("/process", createprocessMockPayments);

export default router;