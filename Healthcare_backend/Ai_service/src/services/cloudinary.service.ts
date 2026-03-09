import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name:process.env.N as string,
  api_key:process.env.K as string,
  api_secret:process.env.S as string,
});

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (file: Express.Multer.File): Promise<any> => {
    console.log("ok",process.env.N,process.env.K,process.env.S)
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `healthcare/${Date.now()}-${Math.random().toString(36).substring(7)}`,
        folder: "healthcare_uploads",
      },
      (error, result) => {
        if (error) {
            console.log(error)
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
     console.log("kl")
    // Convert buffer to stream and pipe to cloudinary
    Readable.from(file.buffer).pipe(stream);
  });
};