import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { 
  uploadMultipleFiles, 
  getJobStatus,
  getPatientReports,
} from "../controllers/image.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router: Router = Router();
router.post("/upload", isAuthenticated, upload.array("files", 10), uploadMultipleFiles);
router.get("/job-status/:jobId", isAuthenticated, getJobStatus);

// GET /images/reports → List patient's uploaded reports (no LLM cost)
router.get("/reports", isAuthenticated, getPatientReports);

export default router;
