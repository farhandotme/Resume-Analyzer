import { Router } from "express";
import {
  login,
  logout,
  profile,
  setPassword,
  verifyEmail,
  verifyOtp,
} from "../controllers/userControllers";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/verify-email", verifyEmail);
router.post("/verify-otp", verifyOtp);
router.post("/set-password", setPassword);
router.post("/login", login);
router.post("/profile", verifyToken, profile);
router.get("/logout", logout);

export default router;
