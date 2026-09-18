import express, { Router } from "express"
import { createReservations } from "../controllers/reservationController.js"


const router  = express.Router()


router.post("/",createReservations)


export  default router 