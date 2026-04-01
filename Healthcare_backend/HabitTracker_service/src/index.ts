import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDb } from "./config/db.js";

connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `✅ HabitTracker service is running on port ${process.env.PORT}`
      );
    });
  })
  .catch((error: Error) => {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
