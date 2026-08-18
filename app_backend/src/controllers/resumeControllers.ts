import type { Request, Response } from "express";
import axios from "axios";

const FASTAPI_URL = process.env.FASTAPI_URL;

// uploading the resume

// needs the pdfurl, job title ,and resumeId for analyzing it
export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const { pdfUrl, jobTitle } = req.body;

    if (!pdfUrl || !jobTitle) {
      return res.status(400).json({
        success: false,
        error: "pdfUrl and jobTitle are required.",
      });
    }

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
            // Pass the error message from FastAPI
            reject(new Error(statusData.error || "Analysis failed."));
          }
        } catch (err: any) {
          clearInterval(interval);
          // If axios error (e.g., 400/500 from FastAPI), extract the error
          if (err.response?.data?.error) {
            reject(new Error(err.response.data.error));
          } else {
            reject(err);
          }
        }
      }, 3000);
    });

    // Step 5 — return everything
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Analyze resume error:", error);

    const errorMessage = error.message || "Analysis failed. Try again.";

    // Check if it's a validation error (400) vs server error (500)
    if (
      errorMessage.includes("does not appear to be a resume") ||
      errorMessage.includes("not a resume") ||
      errorMessage.includes("data not found") ||
      errorMessage.includes("no readable text") ||
      errorMessage.includes("no extractable text") ||
      errorMessage.includes("too short")
    ) {
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    // For other errors, return 500
    return res.status(500).json({
      success: false,
      error: "Analysis failed. Try again.",
    });
  }
};
export const chatResume = async (req: Request, res: Response) => {
  try {
    const { pdfUrl, message, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required to maintain chat history.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Please enter the message you want to ask.",
      });
    }

    // Forward to FastAPI with session_id
    const fastApiRes = await axios.post(`${FASTAPI_URL}/chat`, {
      pdf_url: pdfUrl || null,
      message,
      session_id: sessionId,
    });

    return res.status(200).json({
      success: true,
      data: fastApiRes.data,
    });
  } catch (error: any) {
    console.error(
      "Chat Error:",
      error?.response?.data || error.message || error,
    );

    const errorMessage =
      error?.response?.data?.error || "Failed to process chat request.";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};
