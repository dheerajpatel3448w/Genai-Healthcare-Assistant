import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import doctorRoutes from "./routes/docter.route.js";

dotenv.config();

const app: Express = express();
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
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
app.use("/doctor", doctorRoutes);

export default app;