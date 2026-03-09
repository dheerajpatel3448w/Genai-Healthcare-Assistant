import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { 
  uploadMultipleFiles, 
  getJobStatus,
} from "../controllers/image.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Upload and Job Queue Routes
// Upload files and queue text extraction jobs (protected)
router.post("/upload", isAuthenticated, upload.array("files", 10), uploadMultipleFiles);

// Check status of a text extraction job (protected)
router.get("/job-status/:jobId", isAuthenticated, getJobStatus);




export default router;
