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
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const staff = await User.find({ _id: user.staff }, "firstName lastName email role");
  res.json(staff);
});

export const createUser = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password, firstName, lastName, role },
  } = req;
  if (role == "admin") throw new ErrorResponse("Only users with role staff or manager can be created", 401);
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("Token from nonexisting User", 404);

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ firstName, lastName, email, password: hashedPassword, role, creator: userId });

  user.staff.push(newUser);
  user.save();

  res.json(newUser);
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    body: { email, firstName, lastName, role, newPassword, currentPassword },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;
  const userToEdit = await User.findById(id, "+password");
  if (!userToEdit) throw new ErrorResponse("User doesnt exist", 404);

  if (userRole == "staff" && userToEdit._id.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

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

  res.json(userToEdit);
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  if (user.role != "admin") throw new ErrorResponse("Not authorized - only admin can delete users", 401);

  const userToDelete = await User.findById(id);
  if (!userToDelete) throw new ErrorResponse("User doesnt exist", 404);

  if (userToDelete.creator && userToDelete.creator.toString() !== userId) throw new ErrorResponse("Not authorized", 401);
  if (userToDelete.id.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

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
    userToDelete.status = "inactive";
  }

  // user.staff = user.staff.filter((userId) => userId.toString() !== id);
  // user.save();

  res.json({ message: "User deleted" });
});
