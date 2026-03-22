import app from "./app.js";
import dotenv from "dotenv";
import { textExtractionWorker } from "./workers/textExtractionWorker.js";

dotenv.config();

import { connectDb } from "./configs/db.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { intializeSocket } from "./socket.js";

const server = createServer(app);

intializeSocket(server);

connectDb().then(async()=>{

  
    server.listen(process.env.PORT, () => {
  console.log("AI service is running on port " + process.env.PORT);
});
}).catch((error)=>{
    console.error("Failed to connect to the database:", error);
});