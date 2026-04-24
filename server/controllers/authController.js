const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await resend.emails.send({
      from: "Alure <onboarding@resend.dev>",
      to: email,
      subject: "Verify your Alure account ✅",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Welcome to Alure, ${name}! 🎉</h1>
          <p>Please verify your email address to activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Verify Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px;">If you didn't create an account, ignore this email.</p>
          <p style="color: #64748b; font-size: 14px;">The Alure Team 🏔️🏝️</p>
        </div>
      `,
    });

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, getMe, verifyEmail };
