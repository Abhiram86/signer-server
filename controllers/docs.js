import Docs from "../models/Docs.js";
import { PDFDocument } from "pdf-lib";

export const getFiles = async (req, res) => {
  try {
    const files = await Docs.find({ userId: req.query.userId });
    res.status(200).json({ docs: files });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const pdfBuffer = req.files["pdf"][0].buffer;
    const imageBuffer = req.files["signature"][0].buffer;

    const { page, x, y, width, height } = req.body;

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const embedImage = await pdfDoc.embedPng(imageBuffer);

    if (!pdfDoc || !embedImage) {
      return res.status(400).json({ error: "Missing PDF or image" });
    }

    const pages = pdfDoc.getPages();
    const targetPage = pages[parseInt(page) - 1]; // 1-indexed

    const imgWidth = targetPage.getWidth() * parseFloat(width);
    const imgHeight = targetPage.getHeight() * parseFloat(height);
    const imgX = targetPage.getWidth() * parseFloat(x);
    const imgY = targetPage.getHeight() * (1 - parseFloat(y)) - imgHeight;

    targetPage.drawImage(embedImage, {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });

    const finalPdfBytes = await pdfDoc.save();

    const newDoc = new Docs({
      fileName: req.files["pdf"][0].originalname,
      file: {
        data: Buffer.from(finalPdfBytes),
        contentType: "application/pdf",
      },
      userId: req.body.userId,
    });

    await newDoc.save();

    res.status(200).json({ message: "PDF updated and saved to DB." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to process the PDF." });
  }
};
