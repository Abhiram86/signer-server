import express from "express";
import { getUser, login, logout, register } from "../controllers/auth.js";
import {
  validateGetUser,
  validateLogin,
  validateLogout,
  validateRegister,
} from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.get("/getuser", validateGetUser, getUser);
authRouter.post("/logout", validateLogout, logout);

export default authRouter;
