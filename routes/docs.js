import express from "express";
import multer from "multer";
import { getFile, getFiles, uploadFile } from "../controllers/docs.js";
import { validateGetFiles, validateUploadFile } from "../middleware/docs.js";

const docsRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

docsRouter.get("/", validateGetFiles, getFiles);

docsRouter.get("/:sessionToken", getFile);

docsRouter.post(
  "/upload",
  upload.single("file"),
  validateUploadFile,
  uploadFile
);

export default docsRouter;
