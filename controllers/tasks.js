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
    query: { status, area, page, perPage },
  } = req;

  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  let userTasks = [];
  let totalResults = 0;

  let adminUser = null;
  if (userRole == "staff" || userRole == "manager") {
    adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
  }

  // Find areas that belong to the admin user
  const userAreas = await Area.find({
    _id: userRole == "admin" ? user.areas : adminUser.areas,
    users: userRole == "staff" ? { $in: [userId] } : { $exists: true },
  }).populate("users", "firstName lastName");

  // Find tasks that belong to the admin user and have the current user in the assignedTo array or have the current user in the areas
  const query = {
    _id: userRole == "admin" ? user.tasks : adminUser.tasks,
    $or: [{ assignedTo: { $in: [userId] } }, { area: area ? area : { $in: userAreas } }],
    status: status ? status : { $in: ["New", "In Progress", "Finished", "Overdue"] },
  };
  userTasks = await Task.find(query)
    .sort({ createdAt: -1 })
    .populate("area creator assignedTo", "name firstName lastName email")
    .limit(perPage)
    .skip(perPage * (page - 1));

  totalResults = await Task.countDocuments(query);

  if (perPage <= 0) throw new ErrorResponse("Invalid per page number", 400);
  const totalPages = Math.ceil(totalResults / perPage);

  res.json({ tasks: userTasks, totalResults, page, totalPages });
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

  if (userRole == "admin" && !user.areas.includes(area)) throw new ErrorResponse("Not authorized - area doesnt belong to user", 401);
  const foundArea = await Area.findById(area);
  if (!foundArea) throw new ErrorResponse("Area doesnt exist", 404);

  // if (foundArea.adminId.toString() != userId) throw new ErrorResponse("Not authorized  1 - area belongs to another user", 401);

  let adminUser = null;
  let adminId = null;

  if (userRole == "manager") {
    adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);

    if (foundArea.adminId.toString() != adminUser._id.toString()) throw new ErrorResponse("Not authorized 2 - area belongs to another user", 401);
    adminId = adminUser._id;
  } else if (userRole == "admin") {
    adminId = userId;
  } else throw new ErrorResponse("Not authorized - only admin or manager can create tasks", 401);

  const task = await Task.create({ adminId, creator: userId, title, description, area, priority, dueDate, status, finishedDate, assignedTo });

  if (userRole == "admin") {
    user.tasks.push(task);
    user.save();
  } else if (userRole == "manager") {
    adminUser.tasks.push(task);
    adminUser.save();
  } else throw new ErrorResponse("Not authorized - only admin or manager can create tasks", 401);

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
    if (status == "New") {
      task.finishedDate = null;
      task.startedDate = null;
    }
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
