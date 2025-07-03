import { z } from "zod";

const uploadFileSchema = z.object({
  userId: z.coerce.string().min(1),
});

const getFilesSchema = z.object({
  userId: z.string().min(1),
});

export const validateGetFiles = (req, res, next) => {
  try {
    if (!req.cookies.sessionToken)
      return res.status(401).json({ error: "Unauthorized" });
    getFilesSchema.parse(req.query);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const validateUploadFile = (req, res, next) => {
  try {
    if (!req.cookies.sessionToken)
      return res.status(401).json({ error: "Unauthorized" });
    uploadFileSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
