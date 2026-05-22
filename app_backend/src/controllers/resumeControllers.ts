import type { Request, Response } from "express";
import prisma from "../config/db";
import axios from "axios";

const FASTAPI_URL = process.env.FASTAPI_URL;

export const uploadResume = async (req: Request, res: Response) => {
  try {
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({
        success: false,
        error: "PDF URL is required.",
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId as string,
        pdf_url: pdfUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Resume saved successfully.",
      resume: {
        id: resume.id,
        pdfUrl: resume.pdf_url,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    return res.status(500).json({
      success: false,
      error: "Could not save resume. Try again.",
    });
  }
};

export const getAllResume = async (req: Request, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { uploadedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Could not find resumes .Try again",
    });
  }
};
