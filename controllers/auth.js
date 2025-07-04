import User from "../models/User.js";
import bcrypt from "bcrypt";
import { redis } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    if (!user._id)
      return res.status(400).json({ error: "Could not create user" });

    await user.save();
    const sessionToken = uuidv4();

    await redis.set(
      sessionToken,
      JSON.stringify({
        userId: String(user._id),
        username: user.username,
        email: user.email,
      }),
      {
        ex: 10 * 60, // 10 minutes
      }
    );

    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: "/",
    });

    res.status(200).json({
      message: "Registration successful",
      user: {
        userId: String(user._id),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({ error: "Invalid password" });
    }
    const sessionToken = uuidv4();

    await redis.set(
      sessionToken,
      JSON.stringify({
        userId: String(user._id),
        username: user.username,
        email: user.email,
      }),
      {
        ex: 10 * 60, // 10 minutes
      }
    );

    res.cookie("sessionToken", sessionToken, {
      secure: true,
      maxAge: 10 * 60 * 1000, // 10 minutes
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        userId: String(user._id),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  const sessionToken = req.sessionToken;
  try {
    const user = await redis.get(sessionToken);
    if (!user) {
      return res.status(401).json({ error: "session expired" });
    }
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  const { sessionToken } = req.body;
  try {
    await redis.del(sessionToken);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
