import express from "express";
import multer from "multer";
import { getFiles, uploadFile } from "../controllers/docs.js";
import { validateGetFiles, validateUploadFile } from "../middleware/docs.js";

const docsRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

docsRouter.get("/", validateGetFiles, getFiles);

docsRouter.get("/:id", (req, res) => {
  res.send("docs");
});

docsRouter.post(
  "/upload",
  upload.single("pdf"),
  validateUploadFile,
  uploadFile
);

export default docsRouter;
