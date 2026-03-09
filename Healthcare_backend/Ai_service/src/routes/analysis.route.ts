import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { Aianaylisis, AIanaylisisgetReportsByIds } from "../controllers/anaylisis.controller.js";

const router2:Router=Router();


router2.route("/analysis").get(isAuthenticated,Aianaylisis);
router2.route("/analysis/reports").get(isAuthenticated,AIanaylisisgetReportsByIds);
export default router2;