import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import type { RequestHandler } from "express";

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log(process.env.JWT_SECRET)
  if (!token) {
    return next(new ErrorHandler("No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    next(new ErrorHandler("Invalid token", 401));
  }
};
