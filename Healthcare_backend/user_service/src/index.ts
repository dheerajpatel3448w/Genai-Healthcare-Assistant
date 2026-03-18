import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./configs/db.js";


connectDb().then(async()=>{

  
    app.listen(process.env.PORT, () => {
  console.log("Auth service is running on port " + process.env.PORT);
});
}).catch((error)=>{
    console.error("Failed to connect to the database:", error);
});