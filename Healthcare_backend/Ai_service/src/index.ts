import app from "./app.js";
import dotenv from "dotenv";
import vision from '@google-cloud/vision';
import { textExtractionWorker } from "./workers/textExtractionWorker.js";

dotenv.config();

import { connectDb } from "./configs/db.js";


connectDb().then(async()=>{

  
    app.listen(process.env.PORT, () => {
  console.log("AI service is running on port " + process.env.PORT);
});
}).catch((error)=>{
    console.error("Failed to connect to the database:", error);
});