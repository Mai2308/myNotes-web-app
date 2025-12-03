import jwt from "jsonwebtoken";

/**
 * Auth middleware (ESM Version)
 * - Supports: "Authorization" or "authorization" header
 * - Accepts: "Bearer <token>" or raw token
 * - Ensures decoded token contains { id } or { userId }
 * - Adds: req.user = { id, email }
 */
export const protect = (req, res, next) => {
  try {
    // Handle lowercase/uppercase header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // Accept "Bearer <token>" or raw token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // Read secret each time (in case dotenv loads later)
    const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

    // Validate token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Extract user id
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Token payload missing user ID" });
    }

    // Attach a safe user object
    req.user = {
      id: userId,
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default protect;
