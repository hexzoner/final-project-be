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
    query: { status, area },
  } = req;

  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  if (userRole == "staff") {
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);

    // Find areas that belong to the admin user and have the current user in the users array
    const userAreas = await Area.find({
      _id: adminUser.areas,
      users: { $in: [userId] },
    }).populate("users", "firstName lastName");

    // Find tasks that belong to the admin user and have the current user in the assignedTo array or have the current user in the areas
    const userTasks = await Task.find({
      _id: adminUser.tasks,
      $or: [{ assignedTo: { $in: [userId] } }, { area: area ? area : { $in: userAreas } }],
      status: status ? status : { $in: ["New", "In Progress", "Finished", "Overdue"] },
    })
      .sort({ createdAt: -1 })
      .populate("area creator", "name firstName lastName email");
    return res.json(userTasks);
  }

  const userTasks = await Task.find({
    _id: user.tasks,
    status: status ? status : { $in: ["New", "In Progress", "Finished", "Overdue"] },
  })
    .sort({ createdAt: -1 })
    .populate("area creator", "name firstName lastName email");
  res.json(userTasks);
});

export const getTaskById = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!userId) throw new ErrorResponse("Invalid token - User doesnt exist", 404);

  const task = await Task.findById(id);
  if (!task) throw new ErrorResponse("Task doesnt exist", 404);
  if (!task.adminId) throw new ErrorResponse("Invalid Task - no adminId found", 404);

  if (userRole == "admin") {
    if (task.adminId.toString() !== userId) throw new ErrorResponse("Not authorized", 401);
  } else {
    const user = await User.findById(userId);
    if (!user) throw new ErrorResponse("User doesnt exist", 404);
    if (task.adminId.toString() !== user.adminUserId.toString()) throw new ErrorResponse("Not authorized - task belongs to another adminId", 401);
  }

  res.json(task);
});

export const createTask = asyncHandler(async (req, res, next) => {
  const {
    body: { title, description, area, priority, dueDate, status, finishedDate, assignedTo },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const foundArea = await Area.findById(area);
  if (!foundArea) throw new ErrorResponse("Area doesnt exist", 404);
  if (foundArea.creator.toString() != userId) throw new ErrorResponse("Not authorized - area belongs to another user", 401);

  let adminId = null;
  if (userRole == "manager") {
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    adminId = adminUser._id;
  } else {
    adminId = userId;
  }

  const task = await Task.create({ adminId, creator: userId, title, description, area, priority, dueDate, status, finishedDate, assignedTo });
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
  const role = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const task = await Task.findById(id);
  if (!task) throw new ErrorResponse("Task doesnt exist", 404);

  if (!task.adminId) throw new ErrorResponse("Invalid Task - no adminId found", 404);

  if (role == "admin" && task.adminId.toString() !== userId) throw new ErrorResponse("Not authorized (task.creator != userId)", 401);
  if (role == "staff" || role == "manager") {
    const userAdmin = await User.findById(user.adminUserId);
    if (task.adminId.toString() !== userAdmin._id.toString()) throw new ErrorResponse("Not authorized (task.creator != userAdmin)", 401);
  }

  if (title) task.title = title;
  if (description) task.description = description;

  if (area) {
    const foundArea = await Area.findById(area);
    if (!foundArea) throw new ErrorResponse("Area doesnt exist", 404);
    task.area = area;
  }
  if (priority) task.priority = priority;
  if (status) {
    task.status = status;
    if (status == "Finished") task.finishedDate = Date.now();
    if (status == "In Progress") task.startedDate = Date.now();
  }
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
