import { UserRole } from "@prisma/client";
import { z } from "zod";

const SignUpRequestValidator = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum([UserRole.STUDENT, UserRole.PROFESSOR]),
  password: z.string().min(8),
});

export type SignUpRequest = z.infer<typeof SignUpRequestValidator>;

export default SignUpRequestValidator;
