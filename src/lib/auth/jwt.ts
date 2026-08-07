import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "kompas-desa-secret-key";
const JWT_EXPIRES = "7d";

export type JwtPayload = {
  userId: number;
  email: string;
  role: string;
  fullName: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
