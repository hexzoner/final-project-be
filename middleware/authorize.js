import ErrorResponse from "../utils/ErrorResponse.js";

const authorize = (roles) => (req, res, next) => {
  try {
    if (!roles.includes(req.userRole)) throw new ErrorResponse("Unauthorized", 401);

    next();
  } catch (error) {
    next(error);
  }
};

export default authorize;
