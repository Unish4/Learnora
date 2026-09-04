import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

// Protect: Verify JWT and attach user
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Please login to access this resource",
      });
    }

    const result = verifyToken(token);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    const user = await User.findById(result.data.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

// Authorize: Check role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized. Required: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
