import { UserRole } from "@prisma/client";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import * as jsonwebtoken from "jsonwebtoken";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("Error: Missing JWT Secret Key");
}

interface DecodedJWT {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      decodedJWT?: DecodedJWT;
    }
  }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const jwt = req.headers.authorization?.split(" ")[1];

  if (!jwt) {
    return res.status(401).json({ error: "JWT not found" });
  }

  try {
    const decodedJWT = jsonwebtoken.verify(jwt, JWT_SECRET_KEY) as DecodedJWT;

    if (!decodedJWT) {
      return res.status(401).json({ error: "JWT is invalid" });
    }

    req.decodedJWT = decodedJWT;
    next();
  } catch (error) {
    return res.status(401).json({ error: "JWT is invalid" });
  }
};
