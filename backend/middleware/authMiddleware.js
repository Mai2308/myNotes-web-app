import jwt from "jsonwebtoken";

// ✅ Middleware to protect routes
export const protect = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    res.status(401).json({ message: "Token invalid or expired" });
  }
};
