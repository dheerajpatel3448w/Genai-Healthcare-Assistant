import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/image.routes.js";
import ErrorHandler from "./utils/errorHandler.js";
import type { NextFunction, Request, Response } from "express";
import router2 from "./routes/analysis.route.js"; 
dotenv.config();

const app: Express = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/images", router);
app.use("/analysis", router2);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorHandler) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: 500,
  });
});

export default app;