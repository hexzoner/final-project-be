import mongoose from "mongoose";
const { Schema, model } = mongoose;

const taskSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: [true, "Title is required"] },
  creator: { type: Schema.Types.ObjectId, required: [true, "Creator is required"], ref: "User" },
  area: { type: Schema.Types.ObjectId, required: [true, "Area is required"], ref: "Area" },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["New", "Finished", "In Progress"],
    default: "New",
  },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  description: { type: String },
  dueDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  startedDate: { type: Date, default: null },
  finishedDate: { type: Date, default: null },
  isOverdue: { type: Boolean, default: false },
  steps: [
    {
      description: { type: String },
      isCompleted: { type: Boolean, default: false },
    },
  ],
});

export default model("Task", taskSchema);
