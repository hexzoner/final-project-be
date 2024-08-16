import ErrorResponse from "../utils/ErrorResponse.js";

const isOwner = (req, res, next) => {
  try {
    console.log(req.userId, req.params.id);
    if (req.userId !== req.params.id) throw new ErrorResponse("Unauthorized! Not an owner.", 401);

    next();
  } catch (error) {
    next(error);
  }
};

export default isOwner;
