import { TryCatch } from "../utils/TryCatch.js";
import type { RequestHandler, Request, Response} from "express";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { textExtractionQueue } from "../queue/textExtractionQueue.js";


export const uploadMultipleFiles: RequestHandler = TryCatch(async(req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  // Validate files
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files uploaded",
    });
  }

  // Upload files to Cloudinary
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  const uploadedFiles = await Promise.all(uploadPromises);

  // Create ONE single job for all files
  const allFilesData = uploadedFiles.map((file) => ({
    cloudinaryUrl: file.secure_url,
    fileId: file.public_id,
    originalname: file.original_filename,
  }));

  const job = await textExtractionQueue.add(
    "extract-all-text",
    {
      files: allFilesData,
      totalFiles: uploadedFiles.length,
      userId:req.user?.id,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    }
  );

  // Extract relevant data from Cloudinary response
  const fileDetails = uploadedFiles.map((file) => ({
    public_id: file.public_id,
    url: file.secure_url,
    originalname: file.original_filename,
    mimetype: file.resource_type,
    size: file.bytes,
  }));

  res.status(200).json({
    success: true,
    message: `${files.length} file(s) uploaded to Cloudinary. Single job queued for processing.`,
    jobId: job.id,
    files: fileDetails,
  });
});


export const getJobStatus: RequestHandler = TryCatch(async(req: Request, res: Response) => {
  const { jobId } = req.params;

  // Get job from queue
  const job = await textExtractionQueue.getJob(jobId as string);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const state = await job.getState();
  const progress = job.progress;
  const data = job.data;
  const result = job.returnvalue;

  res.status(200).json({
    success: true,
    jobId: job.id,
    state: state,
    progress: progress,
    totalFiles: data.totalFiles,
    data: data,
    result: result,
  });
});

  

