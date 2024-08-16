import mongoose from "mongoose";
const { Schema, model } = mongoose;

const taskSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  area: { type: Schema.Types.ObjectId, ref: "Area" },
  status: { type: String, enum: ["New", "Finished", "Overdue"] },
  priority: { type: String, enum: ["High", "Medium", "Low"] },
  description: { type: String },
  dueDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default model("Task", taskSchema);
