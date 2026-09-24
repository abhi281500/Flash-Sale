import Reservation from "../models/Reservation.models.js";

const EXPIRE_INTERVAL = 5000;

export const processExpiredReservations = async () => {
  const result = await Reservation.updateMany(
    {
      status: "ACTIVE",
      expiresAt: { $lte: new Date() }
    },
    {
      $set: {
        status: "EXPIRED"
      }
    }
  );

  if (result.modifiedCount > 0) {
    console.log(
      `Expired reservations: ${result.modifiedCount}`
    );
  }
};

export const startReservationExpiryWorker = () => {
  const run = async () => {
    try {
      await processExpiredReservations();
    } catch (error) {
      console.error(
        "Reservation expiry worker error:",
        error.message
      );
    } finally {
      setTimeout(run, EXPIRE_INTERVAL);
    }
  };

  run();
};