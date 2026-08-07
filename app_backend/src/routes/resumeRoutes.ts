import { Router } from "express";
import {
  analyzeResume,
  chatResume,
  getOneAnalysis,
  uploadResume,
} from "../controllers/resumeControllers";
const router = Router();

router.post("/upload", uploadResume);

// analysis — one route does the full flow
router.post("/analyze", analyzeResume);

// history
router.get("/history/:id", getOneAnalysis);

// chat - chat about the resume
router.post("/chat", chatResume);

export default router;
