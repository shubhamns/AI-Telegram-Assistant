import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { User, type IUser } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { env } from "../config/env.js";
import * as emailService from "./email.service.js";
import * as workspaceService from "./workspace.service.js";
function makeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function expiryDate(value: string): Date {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 86400000);
  const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + Number(match[1]) * units[match[2]]);
}
function signJwt(user: IUser): string {
  return jwt.sign({ sub: user._id.toString(), workspaceId: user.workspaceId.toString() }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}
export function verifyJwt(token: string): { userId: string; workspaceId: string } {
  const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; workspaceId: string };
  return { userId: payload.sub, workspaceId: payload.workspaceId };
}
async function issueSession(user: IUser) {
  const workspace = await Workspace.findById(user.workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  const refreshToken = makeToken();
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  user.refreshTokenExpires = expiryDate(env.JWT_REFRESH_EXPIRES_IN);
  await user.save();
  return { token: signJwt(user), refreshToken, user: serializeUser(user), workspace: workspaceService.serializeWorkspace(workspace) };
}
export async function register(data: { email: string; password: string; name: string }) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error("Email already registered");
  const linkCode = crypto.randomBytes(4).toString("hex");
  const workspace = await Workspace.create({
    name: `${data.name}'s Workspace`,
    ownerId: new Types.ObjectId(),
    plan: "free",
    telegramLinkCode: linkCode,
    timezone: env.APP_TIMEZONE,
    usage: { aiMessages: 0, reminders: 0, brainDumps: 0, periodStart: new Date() },
  });
  const verifyToken = makeToken();
  const user = await User.create({
    email: data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(data.password, 12),
    name: data.name,
    workspaceId: workspace._id,
    emailVerified: env.NODE_ENV === "test",
    verifyToken: env.NODE_ENV === "test" ? undefined : verifyToken,
    verifyTokenExpires: env.NODE_ENV === "test" ? undefined : new Date(Date.now() + 86400000),
  });
  workspace.ownerId = user._id;
  await workspace.save();
  if (env.NODE_ENV !== "test") await emailService.sendVerificationEmail(user.email, user.name, verifyToken);
  return { email: user.email, message: "Verification email sent. Please verify your email before signing in." };
}
export async function login(data: { email: string; password: string }) {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) throw Object.assign(new Error("Invalid email. Invalid password."), { fields: { email: "Invalid email", password: "Invalid password" } });
  if (!(await bcrypt.compare(data.password, user.passwordHash))) throw Object.assign(new Error("Invalid password"), { fields: { password: "Invalid password" } });
  if (!user.emailVerified) throw new Error("Please verify your email before signing in");
  return issueSession(user);
}
export async function refreshSession(refreshToken: string) {
  const user = await User.findOne({ refreshTokenHash: hashRefreshToken(refreshToken), refreshTokenExpires: { $gt: new Date() } });
  if (!user) throw new Error("Invalid or expired refresh token");
  if (!user.emailVerified) throw new Error("Please verify your email before signing in");
  return issueSession(user);
}
export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1, refreshTokenExpires: 1 } });
}
export async function logoutByRefreshToken(refreshToken: string) {
  await User.findOneAndUpdate({ refreshTokenHash: hashRefreshToken(refreshToken) }, { $unset: { refreshTokenHash: 1, refreshTokenExpires: 1 } });
}
export async function verifyEmail(token: string) {
  const user = await User.findOne({ verifyToken: token, verifyTokenExpires: { $gt: new Date() } });
  if (!user) throw new Error("Invalid or expired verification link");
  user.emailVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save();
  return serializeUser(user);
}
export async function resendVerificationByEmail(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.emailVerified) return;
  const verifyToken = makeToken();
  user.verifyToken = verifyToken;
  user.verifyTokenExpires = new Date(Date.now() + 86400000);
  await user.save();
  if (env.NODE_ENV !== "test") await emailService.sendVerificationEmail(user.email, user.name, verifyToken);
}
export async function resendVerification(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.emailVerified) throw new Error("Email already verified");
  const verifyToken = makeToken();
  user.verifyToken = verifyToken;
  user.verifyTokenExpires = new Date(Date.now() + 86400000);
  await user.save();
  await emailService.sendVerificationEmail(user.email, user.name, verifyToken);
}
export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;
  const resetToken = makeToken();
  user.resetToken = resetToken;
  user.resetTokenExpires = new Date(Date.now() + 3600000);
  await user.save();
  if (env.NODE_ENV !== "test") await emailService.sendResetEmail(user.email, user.name, resetToken);
}
export async function resetPassword(token: string, password: string) {
  const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } });
  if (!user) throw new Error("Invalid or expired reset link");
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  user.refreshTokenHash = undefined;
  user.refreshTokenExpires = undefined;
  await user.save();
}
export async function getAuthContext(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const workspace = await Workspace.findById(user.workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  return { user: serializeUser(user), workspace: workspaceService.serializeWorkspace(workspace) };
}
function serializeUser(user: IUser) {
  return { id: user._id.toString(), email: user.email, name: user.name, emailVerified: user.emailVerified, workspaceId: user.workspaceId.toString() };
}
