import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: { user: env.EMAIL, pass: env.PASS },
});
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({ from: env.EMAIL, to, subject, html });
  } catch (err) {
    logger.error("Email send failed", err);
    throw new Error("Failed to send email");
  }
}
export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(to, "Verify your email", `<p>Hi ${name},</p><p><a href="${url}">Verify your email</a></p><p>Or copy: ${url}</p>`);
}
export async function sendResetEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(to, "Reset your password", `<p>Hi ${name},</p><p><a href="${url}">Reset password</a></p><p>Or copy: ${url}</p>`);
}
