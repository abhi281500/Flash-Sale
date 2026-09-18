# Flash Sale Seat Booking Engine

A high-concurrency event ticket booking backend built with Node.js,
Express, MongoDB and Redis.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis

## Current Features

- Event and seat management
- Temporary seat reservation
- Redis seat holds
- Redis TTL
- Race-condition protection using Redis NX
- MongoDB transactions
- Payment lifecycle
- Mock payment processing
- Idempotency-Key
- Request hashing with SHA-256

## Booking Flow

Reservation
→ Redis Hold
→ Payment
→ Payment Success
→ Booking Finalization

## Current Status

Backend API implementation in progress.