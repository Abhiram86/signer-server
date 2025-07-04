import { z } from "zod";

const signSchema = z.object({
  senderEmail: z.string().email(),
  docId: z.string().min(1),
  email: z.string().email(),
});

export const validateSign = (req, res, next) => {
  if (!req.cookies.sessionToken)
    return res.status(401).json({ error: "Unauthorized" });
  try {
    signSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
