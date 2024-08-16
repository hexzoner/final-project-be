import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().populate("areas");
  res.json(users);
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  res.json(user.staff);
});
