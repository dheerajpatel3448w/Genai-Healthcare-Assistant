import { Router } from "express";
import { login, register2, logout, getMe } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Public routes
router.post("/register", register2);
router.route("/login").post(login);
router.route("/logout").post(logout);

// Protected routes
router.route("/me").get(isAuthenticated, getMe);

export default router;