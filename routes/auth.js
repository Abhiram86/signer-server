import express from "express";
import { getUser, login, logout, register } from "../controllers/auth.js";
import {
  optionsMiddleware,
  validateGetUser,
  validateLogin,
  validateLogout,
  validateRegister,
} from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.options("*", (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://signer-client-gray.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});

authRouter.post("/register", validateRegister, register);
authRouter.options("/login", (req, res) =>
  res.status(200).json({ message: "OK" })
);
authRouter.post("/login", optionsMiddleware, validateLogin, login);
authRouter.get("/getuser", validateGetUser, getUser);
authRouter.post("/logout", validateLogout, logout);

export default authRouter;
