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
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ErrorHandler(401, "Please login to access this resource");
  }
 console.log(token)
  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log(error)
    throw new ErrorHandler(401, "Invalid or expired token");
  }
};
