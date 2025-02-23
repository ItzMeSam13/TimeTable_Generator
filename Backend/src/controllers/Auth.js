
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken"; // ✅ Import JWT
import dotenv from "dotenv";

dotenv.config(); // ✅ Load environment variables

const prisma = new PrismaClient();

// ✅ *Signup (Register) Student*
export async function create_user(req, res) {
    const { email, phone, name, password } = req.body; 

    // Validate input fields
    if (!email || !phone || !name || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email" });
    }

    if (!validator.isMobilePhone(phone, "any")) {
        return res.status(400).json({ error: "Invalid phone number" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { email, phone, name, password: hashedPassword },
        });

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(201).json({ message: "User created successfully", token, user });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// ✅ *Login Student*
export async function login_user(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function get_user_profile(req, res) {
    try {
        // Extract user ID from JWT (set by middleware)
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid request. User ID is required." });
        }

        // Fetch user details (excluding password)
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { id: true, email: true, phone: true, name: true, createdAt: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
