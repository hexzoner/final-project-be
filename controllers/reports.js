import User from "../models/User.js";
import Task from "../models/Task.js";
import Area from "../models/Area.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getStats = asyncHandler(async (req, res, next) => {
  const {
    query: { area },
  } = req;

  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  const userTasks = await Task.find({
    _id: user.tasks,
    area: area ? area : { $in: user.areas },
  }).populate("area creator", "name firstName lastName email");

  const remaining = userTasks.filter((x) => x.status == "New");
  const recordsToday = userTasks.filter((x) => new Date(x.createdAt).toLocaleDateString() == new Date().toLocaleDateString());
  const finishedTasks = userTasks.filter((x) => x.status == "Finished");
  const onTimeRate = finishedTasks.length / (finishedTasks.length + userTasks.filter((x) => x.status == "Overdue").length);
  // const hoursWorked = userTasks.reduce((hours, x) => hours + (x.finishedDate - x.createdAt), 0);

  let hoursWorked = 0;
  for (let i = 0; i < userTasks.length; i++) {
    if (userTasks[i].status == "Finished") {
      hoursWorked += Math.round((userTasks[i].finishedDate - userTasks[i].createdAt) / (1000 * 60 * 60 * 8));
    }
  }
  // const remaining = await Task.find({ _id: user.tasks, status: "New" });
  // const recordsToday = await Task.find({ _id: user.tasks, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } });

  res.json({
    recordsToday: recordsToday.length,
    hoursWorked: hoursWorked,
    onTimeRate: onTimeRate ? onTimeRate : 0,
    tasksRemaining: remaining.length,
  });
});

export const getWeekTasks = asyncHandler(async (req, res, next) => {
  const {
    query: { area },
  } = req;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const tasksLastWeek = await Task.find({
    _id: user.tasks,
    area: area ? area : { $in: user.areas },
    createdAt: { $gte: new Date() - 7 * 24 * 60 * 60 * 1000 },
  }).populate("area creator", "name firstName lastName email");
  res.json(tasksLastWeek);
});
