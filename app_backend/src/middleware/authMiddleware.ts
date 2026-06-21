import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token is missing.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "Server misconfiguration.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      iat: number;
      exp: number;
    };

    // Store userId on request
    req.userId = decoded.userId;

    console.log("===== Auth Middleware =====");
    console.log("Header:", authHeader);
    console.log("Token:", token);
    console.log("Decoded:", decoded);
    console.log("Assigned userId:", req.userId);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
    });
  }
};
