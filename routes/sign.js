import express from "express";
import { sign, signFile } from "../controllers/sign.js";
import { validateSign } from "../middleware/sign.js";
import multer from "multer";

export const signRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

signRouter.post("/", validateSign, sign);

signRouter.post(
  "/file",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (!req.cookies.sessionToken)
      return res.status(401).json({ error: "Unauthorized" });
    next();
  },
  signFile
);
