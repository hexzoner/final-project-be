import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password, firstName, lastName, role },
  } = req;
  const found = await User.findOne({ email });
  if (found) throw new ErrorResponse("Email is already registered!", 409);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, password: hashedPassword, role });
  const token = jwt.sign({ userId: user._id, email, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ user: { id: user._id, firstName, lastName, email, role, createdAt: user.createdAt }, token });
});

export const signIn = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password },
  } = req;

  const found = await User.findOne({ email }, "+password");
  if (!found) throw new ErrorResponse("Email not found", 401);

  const passwordMatch = await bcrypt.compare(password, found.password);
  if (!passwordMatch) throw new ErrorResponse("Wrong password", 401);

  const token = jwt.sign({ userId: found._id, email, role: found.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ user: { id: found._id, firstName: found.firstName, lastName: found.lastName, email, role: found.role }, token });
});

export const me = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  res.json({ user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
});
