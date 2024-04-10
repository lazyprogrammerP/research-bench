import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Request, Router } from "express";
import * as jsonwebtoken from "jsonwebtoken";
import Prisma from "../../prisma";
import SignInRequestValidator, { SignInRequest } from "../../validators/auth/sign-in-request.validator";
import SignUpRequestValidator, { SignUpRequest } from "../../validators/auth/sign-up-request.validator";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("Error: Missing JWT Secret Key");
}

const AuthRouter = Router();

// Sign-Up Route
AuthRouter.post("/sign-up", async (req: Request<null, { user: User } | { error: "Invalid Request Body"; trace: any }, SignUpRequest, null>, res) => {
  const request = req.body;

  const validation = SignUpRequestValidator.safeParse(request);
  if (!validation.success) {
    console.error(`Validation Error: ${validation.error}`);
    return res.status(400).send({ error: "Invalid Request Body", trace: validation.error });
  }

  // Hash the Password
  const passwordHash = bcrypt.hashSync(request.password, 12);

  // Create the User
  const user = await Prisma.user.create({
    data: {
      name: request.name,
      email: request.email,
      passwordHash: passwordHash,
      role: request.role,
    },
  });

  user.passwordHash = "";
  return res.status(200).send({ user });
});

// Sign-In Route
AuthRouter.post("/sign-in", async (req: Request<null, { user: User; jwt: string } | { error: "Invalid Request Body" | "Invalid Credentials"; trace?: any }, SignInRequest>, res) => {
  const request = req.body;

  const validation = SignInRequestValidator.safeParse(request);
  if (!validation.success) {
    console.error(`Validation Error: ${validation.error}`);
    return res.status(400).send({ error: "Invalid Request Body", trace: validation.error });
  }

  const user = await Prisma.user.findUniqueOrThrow({ where: { email: request.email } });

  // Check if the Password is Correct
  const passwordMatch = bcrypt.compareSync(request.password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).send({ error: "Invalid Credentials" });
  }

  user.passwordHash = "";

  const payload = { id: user.id, email: user.email, role: user.role };
  const jwt = jsonwebtoken.sign(payload, JWT_SECRET_KEY, { expiresIn: "1h" });

  return res.status(200).send({ user, jwt });
});

export default AuthRouter;
