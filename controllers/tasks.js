import User from "../models/User.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getTasks = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  res.json(user.tasks);
});
