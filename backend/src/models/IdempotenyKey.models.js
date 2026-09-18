import mongoose from "mongoose";

const IdempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestHash: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING",
    },

    response: {
      type: mongoose.Schema.Types.Mixed,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);



IdempotencyKeySchema.index(
  { key: 1, userId: 1 },
  { unique: true }
);



IdempotencyKeySchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);


const IdempotencyKey = mongoose.model(
  "IdempotencyKey",
  IdempotencyKeySchema
);

export default IdempotencyKey;