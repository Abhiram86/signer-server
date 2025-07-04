import { redis } from "../config/db.js";
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

export const getFile = async (req, res) => {
  const { sessionToken } = req.params;
  try {
    const signData = await redis.get(sessionToken);
    if (!signData) {
      return res.status(404).json({ error: "Expired" });
    }
    const doc = await Docs.findOne({ _id: signData.docId });
    res.status(200).json({ doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const newDoc = new Docs({
      fileName: req.file.originalname,
      userId: req.body.userId,
      file: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });
    await newDoc.save();
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
