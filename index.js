import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import docsRouter from "./routes/docs.js";
import { signRouter } from "./routes/sign.js";

const app = express();

connectDB();

const corsOptions = {
  origin: "https://signer-client-gray.vercel.app",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions), (req, res) => res.sendStatus(200));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/docs", docsRouter);
app.use("/sign", signRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
