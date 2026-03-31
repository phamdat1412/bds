import jwt from "jsonwebtoken";
import { env } from "../configs/env.js";

export type JwtPayload = {
  userId: string;
  email: string | null;
  userType: "customer" | "staff";
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}