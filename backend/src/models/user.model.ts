import mongoose, { Schema, Document, Types } from "mongoose";
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  verifyToken?: string;
  verifyTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  refreshTokenHash?: string;
  refreshTokenExpires?: Date;
  workspaceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpires: { type: Date },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    refreshTokenHash: { type: String, index: true, sparse: true },
    refreshTokenExpires: { type: Date },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);
export const User = mongoose.model<IUser>("User", userSchema);
