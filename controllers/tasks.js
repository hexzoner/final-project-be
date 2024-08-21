import User from "../models/User.js";
import Task from "../models/Task.js";
import Area from "../models/Area.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getAllTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.find().populate("creator area", "firstName lastName email name");
  res.json(tasks);
});

export const getTasks = asyncHandler(async (req, res, next) => {
  const {
    query: { status },
  } = req;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  const userTasks = await Task.find({
    _id: user.tasks,
    status: status ? status : { $in: ["New", "In Progress", "Finished", "Overdue"] },
  }).populate("area creator", "name firstName lastName email");
  res.json(userTasks);
});

export const createTask = asyncHandler(async (req, res, next) => {
  const {
    body: { title, description, area, priority, dueDate, status, finishedDate, assignedTo },
  } = req;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const foundArea = await Area.findById(area);
  if (!foundArea) throw new ErrorResponse("Area doesnt exist", 404);
  if (foundArea.creator.toString() != userId) throw new ErrorResponse("Not authorized - area belongs to another user", 401);

  const task = await Task.create({ creator: userId, title, description, area, priority, dueDate, status, finishedDate, assignedTo });
  user.tasks.push(task);
  user.save();
  res.json(task);
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    body: { title, description, area, priority, dueDate, status, finishedDate, assignedTo },
  } = req;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const task = await Task.findById(id);
  if (!task) throw new ErrorResponse("Task doesnt exist", 404);

  if (task.creator.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

  if (title) task.title = title;
  if (description) task.description = description;

  if (area) {
    const foundArea = await Area.findById(area);
    if (!foundArea) throw new ErrorResponse("Area doesnt exist", 404);
    task.area = area;
  }
  if (priority) task.priority = priority;
  if (status) task.status = status;
  if (dueDate) task.dueDate = dueDate;
  if (finishedDate) task.finishedDate = finishedDate;
  if (assignedTo) task.assignedTo = assignedTo;
  task.save();

  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const task = await Task.findById(id);
  if (!task) throw new ErrorResponse("Task doesnt exist", 404);

  if (task.creator.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

  await Task.findByIdAndDelete(id);

  user.tasks = user.tasks.filter((taskId) => taskId.toString() !== id);
  user.save();

  res.json({ message: "Task deleted" });
});
