import dotenv from "dotenv";
import { Router } from "express";
import multer from "multer";
import Prisma from "../../prisma";
import gentv from "../../utils/gentv";

dotenv.config();

// Configurations
const storage = multer.memoryStorage();
const mustore = multer({ storage });

const AIRouter = Router();

AIRouter.post("/summarize-research", mustore.single("file"), async (req, res) => {
  const userId = req.decodedJWT?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const requestFile = req.file;

  if (!requestFile) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (requestFile.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Invalid file type" });
  }

  const base64Images = await gentv.encode(requestFile);

  const ocrResult = await gentv.base64OCR(base64Images);
  const highlights = await gentv.generateHighlights(ocrResult);

  const file = await Prisma.file.create({ data: { name: requestFile.originalname, content: ocrResult, highlights, authorId: parseInt(userId) } });

  return res.status(200).json({ file });
});

export default AIRouter;
