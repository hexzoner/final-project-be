import User from "../models/User.js";
import Area from "../models/Area.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const getAllAreas = asyncHandler(async (req, res, next) => {
  const areas = await Area.find().populate("creator", "firstName lastName email");
  res.json(areas);
});

export const getAreas = asyncHandler(async (req, res, next) => {
  const {
    query: { page, perPage },
  } = req;

  const userId = req.userId;
  const user = await User.findById(userId);
  const userRole = req.userRole;

  if (!user) throw new ErrorResponse("User doesnt exist", 404);
  let userAreas = [];
  let totalResults = 0;
  let adminUser = null;

  if (userRole == "staff" || userRole == "manager") {
    adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
  }

  const query = {
    _id: userRole == "admin" ? user.areas : adminUser.areas,
    users: userRole == "staff" ? { $in: [userId] } : { $exists: true },
  };

  userAreas = await Area.find(query)
    .sort({ createdAt: -1 })
    .populate("users", "firstName lastName")
    .limit(perPage)
    .skip(perPage * (page - 1));

  totalResults = await Area.countDocuments(query);

  if (perPage <= 0) throw new ErrorResponse("Invalid per page number", 400);
  const totalPages = Math.ceil(totalResults / perPage);

  res.json({ areas: userAreas, page, totalResults, totalPages });
});

export const createArea = asyncHandler(async (req, res, next) => {
  const {
    body: { name, users, status, address, contact },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  let area = null;
  if (userRole == "admin") {
    area = await Area.create({ adminId: userId, creator: userId, name, users, status, address, contact });
    user.areas.push(area);
    user.save();
  } else if (userRole == "manager") {
    if (!user.adminUserId) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    const adminUser = await User.findById(user.adminUserId);
    area = await Area.create({ adminId: user.adminUserId, creator: userId, name, users, status, address, contact });
    adminUser.areas.push(area);
    adminUser.save();
  } else throw new ErrorResponse("Only users with role admin/manager can create areas", 401);

  const populatedArea = await Area.findById(area._id).populate("users", "firstName lastName");
  res.json(populatedArea);
});

export const updateArea = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    body: { name, users, status, address, contact },
  } = req;
  const userId = req.userId;
  const userRole = req.userRole;
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  const area = await Area.findById(id);
  if (!area) throw new ErrorResponse("Area doesnt exist", 404);

  if (userRole == "admin" && !user.areas.includes(area._id.toString())) throw new ErrorResponse("Not authorized", 401);

  if (userRole == "manager") {
    if (!user.adminUserId) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    if (!adminUser.areas.includes(area._id.toString())) throw new ErrorResponse("Not authorized", 401);
  }

  if (name) area.name = name;
  if (users) area.users = users;
  if (status) area.status = status;
  if (address) area.address = address;
  if (contact) area.contact = contact;
  await area.save();

  const populatedArea = await Area.findById(id).populate("users", "firstName lastName");

  res.json(populatedArea);
});

export const deleteArea = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const userId = req.userId;
  const userRole = req.userRole;
  const area = await Area.findById(id);
  if (!area) throw new ErrorResponse("Area doesnt exist", 404);

  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse("User doesnt exist", 404);

  if (userRole == "admin" && !user.areas.includes(area._id.toString())) throw new ErrorResponse("Not authorized", 401);

  if (userRole == "manager") {
    if (!user.adminUserId) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    if (!adminUser.areas.includes(area._id.toString())) throw new ErrorResponse("Not authorized", 401);
  }

  await Area.findByIdAndDelete(id);

  user.areas = user.areas.filter((areaId) => areaId.toString() !== id);
  user.save();

  res.json({ message: "Area deleted" });
});
