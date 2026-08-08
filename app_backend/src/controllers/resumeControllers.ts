import type { Request, Response } from "express";
import prisma from "../config/db";
import axios from "axios";

const FASTAPI_URL = process.env.FASTAPI_URL;

// uploading the resume

// needs the pdfurl, job title ,and resumeId for analizing it
export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const { pdfUrl, jobTitle } = req.body;

    if (!pdfUrl || !jobTitle) {
      return res.status(400).json({
        success: false,
        error: "pdfUrl and jobTitle are required.",
      });
    }

    console.log("===== Resume Controller =====");
    console.log("req.userId:", req.userId);
    console.log("Authorization:", req.headers.authorization);
    // Step 1 — save resume to database
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId as string,
        pdf_url: pdfUrl,
      },
    });

    // Step 2 — send to FastAPI and get job_id
    const fastApiRes = await axios.post(`${FASTAPI_URL}/analyze`, {
      pdf_url: pdfUrl,
      job_title: jobTitle,
    });
    const { job_id } = fastApiRes.data;

    // Step 3 — poll until done
    const result = await new Promise<any>((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(
            `${FASTAPI_URL}/analyze/status/${job_id}`,
          );
          const statusData = statusRes.data;

          if (statusData.status === "done") {
            clearInterval(interval);
            resolve(statusData.data);
          } else if (statusData.status === "failed") {
            clearInterval(interval);
            reject(new Error(statusData.error || "Analysis failed."));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 3000);
    });

    // Step 4 — save result to database
    const analysis = await prisma.analysis.create({
      data: {
        userId: req.userId as string,
        resumeId: resume.id,
        jobTitle,
        atsScore: result?.hero?.ats_score || 0,
        fullResult: result,
      },
    });

    // Step 5 — return everything
    return res.status(200).json({
      success: true,
      analysisId: analysis.id,
      resumeId: resume.id,
      data: result,
    });
  } catch (error) {
    console.error("Analyze resume error:", error);
    return res.status(500).json({
      success: false,
      error: "Analysis failed. Try again.",
    });
  }
};

export const chatResume = async (req: Request, res: Response) => {
  try {
    const { pdfUrl, message } = req.body;

    if (!pdfUrl) {
      return res
        .status(404)
        .json({ success: false, error: "Please Upload the PDF" });
    }
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Please Enter the message You want to Ask",
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId as string,
        pdf_url: pdfUrl,
      },
    });

    const fastApiRes = await axios.post(`${FASTAPI_URL}/chat`, {
      pdf_url: pdfUrl,
      message,
      user_id: req.userId as string,
    });

    return res.status(200).json({
      success: true,
      data: fastApiRes.data,
    });
  } catch (error) {
    console.log("error");
    return res.status(500).json({
      success: false,
      error,
    });
  }
};
