import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import type { Request, Response, NextFunction } from "express";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from cookies or Authorization header
  // Supports both "Bearer <token>" and raw "<token>" in Authorization header
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader; // raw token without Bearer prefix

  const token = req.cookies?.token || headerToken;

  const secret = (process.env.JWT_SECRET as string)?.trim();
  console.log("[auth] secret length:", secret?.length, "token exists:", !!token);

  if (!token) {
    throw new ErrorHandler(401, "Please login to access this resource");
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      secret
    ) as any;

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log(error)
    throw new ErrorHandler(401, "Invalid or expired token");
  }
};
