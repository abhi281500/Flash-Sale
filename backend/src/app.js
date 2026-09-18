import express from "express"
import cors from "cors"
import eventRoutes from "./routes/eventRoutes.js"
import reservationRoutes from "./routes/reservationRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import paymentRoutes  from "./routes/paymentRoutes.js"


const app = express()


app.use(cors())


app.use(
    express.json()
)

app.use(
    express.urlencoded({
        extended :true
    })
)

app.use("/api/v1/events",eventRoutes );
app.use("/api/v1/reservations",reservationRoutes );
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/booking",bookingRoutes);
app.use("/api/v1/payment",paymentRoutes);


export default app