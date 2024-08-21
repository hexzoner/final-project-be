import User from "../models/User.js";
import Area from "../models/Area.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getAllAreas = asyncHandler(async (req, res, next) => {
  const areas = await Area.find().populate("creator", "firstName lastName email");
  res.json(areas);
});

export const getAreas = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const userAreas = await Area.find({ _id: user.areas }).populate('users', 'firstName lastName');

  res.json(userAreas);
});

export const createArea = asyncHandler(async (req, res, next) => {
  const {
    body: { name, users, status, address, contact },
  } = req;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const area = await Area.create({ creator: userId, name, users, status, address, contact });

  user.areas.push(area);
  user.save();

  const populatedArea = await Area.findById(area._id).populate('users', 'firstName lastName');

  res.json(populatedArea);
});

export const updateArea = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    body: { name, users, status, address, contact },
  } = req;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const area = await Area.findById(id);
  if (!area) throw new ErrorResponse("Area doesnt exist", 404);

  if (area.creator.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

  if (name) area.name = name;
  if (users) area.users = users;
  if (status) area.status = status;
  if (address) area.address = address;
  if (contact) area.contact = contact;
  area.save();

  const populatedArea = await Area.findById(id).populate('users', 'firstName lastName');

  res.json(populatedArea);
});

export const deleteArea = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  if (user.role != "admin") throw new ErrorResponse("Not authorized - only admin can delete areas", 401);

  const area = await Area.findById(id);
  if (!area) throw new ErrorResponse("Area doesnt exist", 404);

  if (area.creator.toString() !== userId) throw new ErrorResponse("Not authorized", 401);

  await Area.findByIdAndDelete(id);

  user.areas = user.areas.filter((areaId) => areaId.toString() !== id);
  user.save();

  res.json({ message: "Area deleted" });
});
