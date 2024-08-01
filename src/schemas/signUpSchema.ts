import { z } from "zod";

export const usernameValid = z
  .string()
  .min(2, "Username must be atleast two characters")
  .max(20, "Username must not be more than 20 characters")
  .regex(/^[a-zA-Z0-9]*$/, "Username must not contain special characters");

export const signUpSchema = z.object({
  username: usernameValid,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" }),
});
