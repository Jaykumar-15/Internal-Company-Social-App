/**
 * Input validation schemas using Zod.
 * All user input is validated server-side to prevent injection and enforce rules.
 */
import { z } from "zod";

// Configurable company email domain - defaults to "company.com"
const COMPANY_DOMAIN = process.env.COMPANY_EMAIL_DOMAIN || "company.com";

export const signupSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (email) => email.endsWith(`@${COMPANY_DOMAIN}`),
      `Only @${COMPANY_DOMAIN} emails are allowed`
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  inviteCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  department: z.string().max(255).optional(),
  title: z.string().max(255).optional(),
  skills: z.string().max(1000).optional(),
  bio: z.string().max(2000).optional(),
  show_email: z.boolean().optional(),
});

export const messageSchema = z.object({
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
});
