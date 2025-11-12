import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  createUser,
  findUserByEmail,
  getAllUsers as getUsers,
} from "../models/userModel.js";
import { createRestaurant } from "../models/restaurantModel.js";

dotenv.config();

/* =======================================================
   🔹 REGISTER CONTROLLER
======================================================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, address, location, restaurant } =
      req.body;

    console.log("📦 Received registration data:", req.body);

    // 1️⃣ Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create user record
    const newUser = await createUser(
      name,
      email,
      hashedPassword,
      role,
      address || "Default Address",
      location || { lat: 0, lng: 0 }
    );

    // 4️⃣ If role is restaurant → create restaurant entry
    if (role === "restaurant" && restaurant?.name) {
      await createRestaurant(
        newUser.id,
        restaurant.name,
        restaurant.rating || 0,
        restaurant.menu || []
      );
      console.log(`🍴 Created restaurant profile for user ${newUser.id}`);
    }

    // 5️⃣ Response
    console.log("✅ User created successfully:", newUser);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =======================================================
   🔹 LOGIN CONTROLLER
======================================================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1️⃣ Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ (Optional) Verify role matches (if provided)
    if (role && user.role && role.toLowerCase() !== user.role.toLowerCase()) {
      return res.status(403).json({
        message: `Selected role "${role}" does not match your account role "${user.role}".`,
      });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ Respond with token and user details
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      message: "Internal server error during login",
      error: err.message,
    });
  }
};

/* =======================================================
   🔹 GET ALL USERS CONTROLLER
======================================================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
};
