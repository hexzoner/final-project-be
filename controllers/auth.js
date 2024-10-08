import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const tokenExpireTime = "7d";

export const signUp = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password, firstName, lastName, role },
  } = req;
  const found = await User.findOne({ email });
  if (found) throw new ErrorResponse("Email is already registered!", 409);
  if (role != "admin") throw new ErrorResponse("Only admin role can signup", 401);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, password: hashedPassword, role });
  const token = jwt.sign({ userId: user._id, email, role }, process.env.JWT_SECRET, { expiresIn: tokenExpireTime });
  res.json({ user: { id: user._id, firstName, lastName, email, role, createdAt: user.createdAt, profileImage: user.profileImage }, token });
});

export const signIn = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password },
  } = req;

  const found = await User.findOne({ email }, "+password");
  if (!found) throw new ErrorResponse("Email not found", 401);

  const passwordMatch = await bcrypt.compare(password, found.password);
  if (!passwordMatch) throw new ErrorResponse("Wrong password", 401);

  if (found.status === "inactive") throw new ErrorResponse("User is inactive", 401);

  const token = jwt.sign({ userId: found._id, email, role: found.role }, process.env.JWT_SECRET, {
    expiresIn: tokenExpireTime,
  });
  res.json({
    user: {
      id: found._id,
      adminUserId: found.adminUserId,
      firstName: found.firstName,
      lastName: found.lastName,
      email,
      role: found.role,
      profileImage: found.profileImage,
    },
    token,
  });
});

export const me = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  res.json({
    user: {
      id: user._id,
      adminUserId: user.adminUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
});

export const refresh = asyncHandler(async (req, res, next) => {
  res.json({ message: "OK" });
});
