import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../config/db.js";
import Docs from "../models/Docs.js";
import { PDFDocument } from "pdf-lib";

export const sign = async (req, res) => {
  dotenv.config();
  const { senderEmail, docId, email } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const sessionToken = uuidv4();
  await redis.set(
    sessionToken,
    JSON.stringify({
      senderEmail,
      docId,
      email,
    }),
    {
      ex: 10 * 60, // 10 minute
    }
  );
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Sign Document",
    html: `
    <p>Hi ${email}, you have been invited to sign a document by ${senderEmail}.</p>
    <p>Click the link below to sign the document:</p>
    <a href="http://localhost:3000/sign/${sessionToken}">Sign Document</a>
    `,
  };
  try {
    console.log(sessionToken);
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to send email" });
  }
};

export const signFile = async (req, res) => {
  try {
    if (!req.files || !req.files["pdf"] || !req.files["signature"]) {
      return res.status(400).json({ error: "Missing PDF or signature file" });
    }
    const pdfBuffer = req.files["pdf"][0].buffer;
    const imageBuffer = req.files["signature"][0].buffer;
    console.log("PDF buffer length:", pdfBuffer.length);
    console.log("Image buffer length:", imageBuffer.length);
    if (pdfBuffer.length === 0) {
      return res.status(400).json({ error: "Empty PDF file" });
    }
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    console.log("PDF header:", pdfHeader);
    if (!pdfHeader.startsWith("%PDF")) {
      console.error(
        "Invalid PDF header. First 20 bytes:",
        pdfBuffer.slice(0, 20)
      );
      return res.status(400).json({ error: "Invalid PDF file format" });
    }
    const { page, x, y, width, height, docId } = req.body;
    // Validate required fields
    if (!page || !x || !y || !width || !height || !docId) {
      return res
        .status(400)
        .json({ error: "Missing required signature parameters" });
    }
    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const embedImage = await pdfDoc.embedPng(imageBuffer);
    const pages = pdfDoc.getPages();
    const pageIndex = parseInt(page) - 1; // Convert to 0-indexed
    if (pageIndex < 0 || pageIndex >= pages.length) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    const targetPage = pages[pageIndex];
    const imgWidth = targetPage.getWidth() * parseFloat(width);
    const imgHeight = targetPage.getHeight() * parseFloat(height);

    // Adjust imgX slightly to the right
    const imgX = targetPage.getWidth() * parseFloat(x); // Add a small offset to shift right

    // Adjust imgY slightly down
    const imgY =
      targetPage.getHeight() -
      (targetPage.getHeight() * parseFloat(y) + imgHeight); // Subtract a small offset to shift down

    targetPage.drawImage(embedImage, {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });
    const finalPdfBytes = await pdfDoc.save();
    const doc = await Docs.findOneAndUpdate(
      { _id: docId },
      {
        $set: {
          file: {
            data: Buffer.from(finalPdfBytes),
            contentType: "application/pdf",
          },
          status: "signed",
          lastModified: new Date(),
        },
      },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json({
      message: "PDF updated and saved to DB successfully",
      docId: doc._id,
    });
  } catch (error) {
    console.error("Error in signFile:", error);
    if (error.message.includes("No PDF header found")) {
      return res.status(400).json({
        error:
          "Invalid PDF file format. The file may be corrupted or not a valid PDF.",
      });
    }
    res.status(500).json({
      error: "Failed to process the PDF",
      details: error.message,
    });
  }
};
