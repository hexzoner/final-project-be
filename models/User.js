import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: [true, "Email image is required"], unique: true },
  password: { type: String, required: [true, "Password is required"], select: false },
  role: { type: String, enum: ["staff", "manager"], required: [true, "Role is required"] },
  staff: [{ type: Schema.Types.ObjectId, ref: "User" }],
  areas: [{ type: Schema.Types.ObjectId, ref: "Area" }],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  createdAt: { type: Date, default: Date.now },
});

export default model("User", userSchema);
