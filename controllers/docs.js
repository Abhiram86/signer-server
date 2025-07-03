import Docs from "../models/Docs.js";

export const getFiles = async (req, res) => {
  try {
    const files = await Docs.find({ userId: req.query.userId });
    res.status(200).json({ docs: files });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadFile = async (req, res) => {
  if (req.file) {
    const { originalname, buffer, mimetype } = req.file;
    const { userId } = req.body;
    const file = new Docs({
      fileName: originalname,
      file: { data: buffer, contentType: mimetype },
      userId,
    });
    await file.save();
    // console.log(originalname, userId);
    res.status(200).json({ message: "File uploaded successfully" });
  } else {
    res.status(400).json({ error: "No file uploaded" });
  }
};
