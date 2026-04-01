import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { Aianaylisis, AIanaylisisgetReportsByIds, getAnalysisHistory } from "../controllers/anaylisis.controller.js";

const router2:Router=Router();


router2.route("/").get(isAuthenticated, Aianaylisis);
router2.route("/reports").post(isAuthenticated, AIanaylisisgetReportsByIds);

// GET /analysis/history → DB-only read of reports + pre-generated analysis (no LLM cost)
router2.route("/history").get(isAuthenticated, getAnalysisHistory);

export default router2;