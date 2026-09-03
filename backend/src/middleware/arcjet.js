import { globalLimiter } from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await globalLimiter.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again later.",
        });
      }
      return res.status(403).json({
        success: false,
        error: "Access denied.",
      });
    }

    next();
  } catch (error) {
    next();
  }
};
