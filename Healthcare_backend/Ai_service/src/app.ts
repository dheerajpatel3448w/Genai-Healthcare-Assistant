import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/image.routes.js";
import ErrorHandler from "./utils/errorHandler.js";
import type { NextFunction, Request, Response } from "express";
import router2 from "./routes/analysis.route.js";
import router3 from "./routes/mainAi.route.js";
import doctorAiRouter from "./routes/doctorAi.route.js";
dotenv.config();

const app: Express = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/images", router);
app.use("/analysis", router2);
app.use("/ai", router3);           // Patient: POST /ai/chat
app.use("/doctor-ai", doctorAiRouter); // Doctor:  POST /doctor-ai/chat


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