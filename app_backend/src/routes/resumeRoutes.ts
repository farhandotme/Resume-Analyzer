import { Router } from "express";
import { analyzeResume, chatResume } from "../controllers/resumeControllers";
const router = Router();

// analysis — one route does the full flow
router.post("/analyze", analyzeResume);

// history

// chat - chat about the resume
router.post("/chat", chatResume);

export default router;
