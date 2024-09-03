import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  adminUserId: { type: Schema.Types.ObjectId, ref: "User" },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String, required: [true, "Password is required"], select: false },
  phone: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: "User", default: null },
  role: { type: String, enum: ["admin", "staff", "manager"], required: [true, "Role is required"] },
  staff: [{ type: Schema.Types.ObjectId, ref: "User" }],
  areas: [{ type: Schema.Types.ObjectId, ref: "Area" }],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String },
});

export default model("User", userSchema);
