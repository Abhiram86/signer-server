import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import docsRouter from "./routes/docs.js";
import { signRouter } from "./routes/sign.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: "https://signer-client-gray.vercel.app",
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Origin",
      "https://signer-client-gray.vercel.app"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(204).end();
  } else {
    next();
  }
});

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
