import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// Generate token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Verify token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    return { success: true, data: decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        success: false,
        error: "Token has expired. Please login again.",
      };
    }
    if (error.name === "JsonWebTokenError") {
      return { success: false, error: "Invalid token." };
    }
    return { success: false, error: "Token verification failed." };
  }
};
