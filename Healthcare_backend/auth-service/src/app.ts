import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/auth.route.js";
import cookieParser from "cookie-parser";


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




app.use("/auth",router);

export default app;