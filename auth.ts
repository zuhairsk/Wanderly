import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "wanderly-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Simple password hashing (in production, use bcrypt)
export function hashPassword(password: string): string {
  // This is a simplified version - in production use bcrypt
  return `hashed_${password}`;
}

export function comparePasswords(password: string, hashedPassword: string): boolean {
  // This is a simplified version - in production use bcrypt
  return `hashed_${password}` === hashedPassword;
}
