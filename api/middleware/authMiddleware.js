import jwt from "jsonwebtoken";

/**
 * Express middleware to protect routes.
 * - Accepts "Authorization: Bearer <token>" (case-insensitive) or a raw token string.
 * - Verifies the token using process.env.JWT_SECRET (falls back to a default only if not provided).
 * - Attaches a safe `req.user` object containing { id, email }.
 */
export const protect = (req, res, next) => {
  try {
    // Accept Authorization header in either lowercase or capitalized form.
    const authHeader = req.headers.authorization ?? req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Support both "Bearer <token>" and raw token values.
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token || token === "null") {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // Read the secret at verification time (handles cases where dotenv was loaded after module import)
    const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

    // Verify token; throws if invalid/expired.
    const decoded = jwt.verify(token, JWT_SECRET);

    // Token payload should include either `userId` or `id`
    const id = decoded?.userId ?? decoded?.id;
    if (!id) {
      return res.status(401).json({ message: "Not authorized, invalid token payload" });
    }

    // Attach a minimal user object to the request (avoid leaking sensitive token data).
    req.user = { id, email: decoded?.email ?? null };

    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default protect;