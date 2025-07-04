import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(4),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const logoutSchema = z.object({
  sessiontoken: z.string(),
});

export const optionsMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.status(200).json({ message: "OK" });
  } else {
    next();
  }
};

export const validateRegister = (req, res, next) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const validateLogin = (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const validateGetUser = (req, res, next) => {
  const sessionToken = req.cookies.sessionToken;

  if (!sessionToken) return res.status(401).json({ error: "Unauthorized" });

  req.sessionToken = sessionToken;
  next();
};

export const validateLogout = (req, res, next) => {
  try {
    logoutSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
