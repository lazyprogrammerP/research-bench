import { z } from "zod";

const SignInRequestValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignInRequest = z.infer<typeof SignInRequestValidator>;

export default SignInRequestValidator;
