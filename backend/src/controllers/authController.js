import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendTokenResponse } from "../utils/generateToken.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const adminEmails = ADMIN_EMAIL ? [ADMIN_EMAIL] : [];
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
      role: isAdminEmail ? "admin" : "user",
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let user = await User.findOne({ email: ADMIN_EMAIL });

      if (!user) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
        user = await User.create({
          name: "Admin",
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: "admin",
          isVerified: true,
        });
      } else {
        user.role = "admin";
        user.isVerified = true;
        await user.save();
      }

      sendTokenResponse(user, 200, res);
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
