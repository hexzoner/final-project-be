import User from "../models/User.js";
import Area from "../models/Area.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import bcrypt from "bcrypt";

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().populate("areas tasks staff");
  res.json(users);
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const {
    query: { page, perPage },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  let adminUser = null;
  if (userRole == "manager") {
    adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
  }

  const query = { _id: userRole == "admin" ? user.staff : adminUser.staff, status: "active" };
  const totalResults = await User.countDocuments(query);
  const staff = await User.find(query)
    .sort({ createdAt: -1 })
    .populate("creator", "firstName lastName email role")
    .limit(perPage)
    .skip(perPage * (page - 1));

  if (perPage <= 0) throw new ErrorResponse("Invalid per page number", 400);
  const totalPages = Math.ceil(totalResults / perPage);

  res.json({ staff, totalResults, page, totalPages });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password, firstName, lastName, role },
  } = req;

  if (role == "admin") throw new ErrorResponse("Only users with role staff or manager can be created", 401);
  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("Token from nonexisting User", 404);

  // Manager tries to create a new user, so we need to find his adminId to assign it to the new user
  let adminId = null;
  let adminUser = null;
  if (userRole == "manager") {
    if (!user.adminUserId) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    adminId = adminUser._id;
  }

  const alreadyExists = await User.findOne({ email });
  if (alreadyExists) throw new ErrorResponse("Email already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminUserId = userRole == "admin" ? userId : adminId;

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    creator: userId,
    // if the user who creates a new user - is admin, we assign his userId to the new user, otherwise its the manager and we assign the adminId
    adminUserId,
  });

  if (userRole == "admin") {
    user.staff.push(newUser);
    user.save();
  } else {
    adminUser.staff.push(newUser);
    adminUser.save();
  }

  res.json({ _id: newUser._id, adminUserId, firstName, lastName, email, role, creator: user, status: "active", createdAt: newUser.createdAt });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    body: { email, firstName, lastName, role, newPassword, currentPassword },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;
  const userToEdit = await User.findById(id, "+password");
  const user = await User.findById(userId);

  if (!userToEdit || !user) throw new ErrorResponse("User doesnt exist", 404);

  if (userRole == "staff" && userToEdit._id.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

  if (userRole == "admin" && !user.staff.includes(id)) throw new ErrorResponse("Not authorized", 401);

  if (userRole == "manager") {
    if (!user.adminUserId) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser.staff.includes(id)) throw new ErrorResponse("Not authorized", 401);
  }

  if (email) {
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists && alreadyExists._id.toString() !== id) {
      // throw new ErrorResponse("Email already exists", 400);
      res.json({ message: "Email already exists" });
    } else userToEdit.email = email;
  }

  if (newPassword && currentPassword) {
    const passwordMatch = await bcrypt.compare(currentPassword, userToEdit.password);
    if (!passwordMatch) {
      // throw new ErrorResponse("Wrong password", 401);
      res.json({ message: "Wrong password" }).status(401);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userToEdit.password = hashedPassword;
  }
  if (firstName) userToEdit.firstName = firstName;
  if (lastName) userToEdit.lastName = lastName;
  if (role) userToEdit.role = role;
  userToEdit.save();

  res.json({
    _id: userToEdit._id,
    adminUserId: userToEdit.adminUserId,
    firstName: userToEdit.firstName,
    lastName: userToEdit.lastName,
    email: userToEdit.email,
    role: userToEdit.role,
    status: userToEdit.status,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const userToDelete = await User.findById(id);
  if (!userToDelete) throw new ErrorResponse("User doesnt exist", 404);

  if (userRole == "admin" && !user.staff.includes(id)) throw new ErrorResponse("Not authorized", 401);
  if (userRole == "manager") {
    if (!user.adminUserId) throw new ErrorResponse("This account doesnt have a AdminUserId", 404);
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - user not found", 404);
    if (!adminUser.staff.includes(id)) throw new ErrorResponse("Not authorized", 401);
  }

  if (userToDelete.role == "admin") {
    for (let i = 0; i < userToDelete.staff.length; i++) {
      await User.findByIdAndDelete(userToDelete.staff[i]);
    }
    for (let i = 0; i < userToDelete.areas.length; i++) {
      await Area.findByIdAndDelete(userToDelete.areas[i]);
    }
    for (let i = 0; i < userToDelete.tasks.length; i++) {
      await Task.findByIdAndDelete(userToDelete.tasks[i]);
    }
    await User.findByIdAndDelete(id);
  } else {
    if (userToDelete.status == "active") userToDelete.status = "inactive";
    else throw new ErrorResponse("User is already inactive", 400);

    // user.staff = user.staff.filter((userId) => userId.toString() !== id);
    // user.save();
    await userToDelete.save();
  }

  res.json({ message: "User deleted" });
});
