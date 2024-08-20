import mongoose from "mongoose";
const { Schema, model } = mongoose;

const areaSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: [true, "Name is required"] },
  address: { type: String },
  contact: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

export default model("Area", areaSchema);
