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
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  if (userRole == "staff") throw new ErrorResponse("Not authorized - staff can't get stats", 401);

  let adminUser = null;
  if (userRole == "manager") {
    adminUser = await User.findById(user.adminUserId);
  }

  const userTasks = await Task.find({
    _id: userRole == "admin" ? user.tasks : adminUser.tasks,
    area: area ? area : { $in: userRole == "admin" ? user.areas : adminUser.areas },
  }).populate("area creator", "name firstName lastName email");

  const remaining = userTasks.filter((x) => x.status == "New");
  const recordsToday = userTasks.filter((x) => new Date(x.createdAt).toLocaleDateString() == new Date().toLocaleDateString());
  const finishedTasks = userTasks.filter((x) => x.status == "Finished");
  const onTimeRate = finishedTasks.length / (finishedTasks.length + userTasks.filter((x) => x.status == "Overdue").length);
  // const hoursWorked = userTasks.reduce((hours, x) => hours + (x.finishedDate - x.createdAt), 0);

  let hoursWorked = 0;
  for (let i = 0; i < userTasks.length; i++) {
    if (userTasks[i].status == "Finished" && userTasks[i].finishedDate && userTasks[i].startedDate) {
      if (userTasks[i].finishedDate - userTasks[i].startedDate < 0) {
        hoursWorked += Math.round((new Date() - userTasks[i].startedDate) / (1000 * 60));
      } else hoursWorked += Math.round((userTasks[i].finishedDate - userTasks[i].startedDate) / (1000 * 60 * 60));
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
    query: { area, page, perPage },
  } = req;

  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  let adminUser = null;
  if (userRole == "manager") {
    adminUser = await User.findById(user.adminUserId);
  }

  const query = {
    _id: userRole == "admin" ? user.tasks : adminUser.tasks,
    area: area ? area : { $in: userRole == "admin" ? user.areas : adminUser.areas },
    createdAt: { $gte: new Date() - 7 * 24 * 60 * 60 * 1000 },
  };
  const totalLastWeek = await Task.countDocuments(query);

  const tasksLastWeek = await Task.find(query)
    .sort({ createdAt: -1 })
    .populate("area creator", "name firstName lastName email")
    .limit(perPage)
    .skip(perPage * (page - 1));

  if (perPage <= 0) throw new ErrorResponse("Invalid per page number", 400);
  const totalPages = Math.ceil(totalLastWeek / perPage);

  res.json({ tasks: tasksLastWeek, totalResults: totalLastWeek, page, totalPages });
});
