import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Folder from "../models/folderModel.js";

// Register a new user (MongoDB)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📝 Register attempt:", { name, email, passwordLength: password?.length });

    if (!name || !email || !password) {
      console.error("❌ Missing fields:", { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email }).exec();
    if (existing) {
      console.error("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("💾 Creating user document...");
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log("✅ User saved:", { id: user._id, email: user.email });

    // Create default Favorites folder for the new user
    console.log("📁 Creating default Favorites folder...");
    const favoritesFolder = new Folder({
      user: user._id,
      name: "Favorites",
      parentId: null,
      isDefault: true
    });
    await favoritesFolder.save();
    console.log("✅ Favorites folder created:", favoritesFolder._id);

    res.status(201).json({ message: "User registered successfully!", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// Login user (MongoDB)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📧 Login attempt:", { email, passwordProvided: !!password });

    if (!email || !password) {
      console.error("❌ Missing credentials:", { email: !!email, password: !!password });
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      console.error("❌ User not found:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("❌ Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "secret123", { expiresIn: "1d" });
    console.log("✅ Login successful for:", email);

    res.json({ message: "Login successful!", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
