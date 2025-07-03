import mongoose from "mongoose";
import dotenv from "dotenv";
import { Redis } from "@upstash/redis";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export const redis = Redis.fromEnv();
