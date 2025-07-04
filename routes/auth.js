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

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", optionsMiddleware, validateLogin, login);
authRouter.get("/getuser", validateGetUser, getUser);
authRouter.post("/logout", validateLogout, logout);

export default authRouter;
