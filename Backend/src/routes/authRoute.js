import { Router } from "express";
import { create_user, login_user } from "../controllers/Auth.js";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware to verify JWT
export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(403).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

router.post("/", create_user);
router.post("/login", login_user);

// Example: Protected Route
router.get("/profile", verifyToken, (req, res) => {
    res.json({ message: "Protected route accessed", user: req.user });
});

export default router;
