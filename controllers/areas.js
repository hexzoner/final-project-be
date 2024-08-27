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
  let total = 0;
  if (userRole == "staff") {
    const adminUser = await User.findById(user.adminUserId);
    if (!adminUser) throw new ErrorResponse("This account doesnt have a valid AdminUserId - not found", 404);
    userAreas = await Area.find({
      _id: adminUser.areas,
      users: { $in: [userId] },
    })
      .populate("users", "firstName lastName")
      .limit(perPage)
      .skip(perPage * (page - 1));

    total = await Area.countDocuments({
      _id: adminUser.areas,
      users: { $in: [userId] },
    });
  } else {
    userAreas = await Area.find({ _id: user.areas })
      .populate("users", "firstName lastName")
      .limit(perPage)
      .skip(perPage * (page - 1));

    total = await Area.countDocuments({ _id: user.areas });
  }

  if (perPage <= 0) throw new ErrorResponse("Invalid per page number", 400);
  const pages = Math.ceil(total / perPage);

  res.json({ areas: userAreas, total, page, pages });
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

  const populatedArea = await Area.findById(area._id).populate("users", "firstName lastName");

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

  const populatedArea = await Area.findById(id).populate("users", "firstName lastName");

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
