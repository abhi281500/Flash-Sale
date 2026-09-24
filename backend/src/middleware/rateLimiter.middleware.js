import redisClient from "../config/redis.js";


export const rateLimiter = ({
  limit = 10,
  windowSeconds = 60
} = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id

      const route = req.baseUrl + req.path;

      const key = `rate_limit:${userId}:${route}`;

      const currentCount = await redisClient.incr(key);

      if (currentCount === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (currentCount > limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later."
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error.message);

      next(error);
    }
  };
};