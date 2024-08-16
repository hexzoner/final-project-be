import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/ErrorResponse.js";

const verifyTokenMiddleware = (req, res, next) => {
  try {
    const {
      headers: { authorization },
    } = req;
    if (!authorization) throw new ErrorResponse("Please login to access this resource", 401);
    const authToken = authorization.split(" ")[1];
    const secret = process.env.JWT_SECRET; // This will come from the server environment
    const payload = jwt.verify(authToken, secret); // Get the payload if verification is successful
    if (!payload) throw new ErrorResponse("Invalid token", 400);

    req.userId = payload.userId; // Create custom property in request object
    req.userRole = payload.role; // Create custom property in request object
    next(); // Call next handler
  } catch (e) {
    next(e);
  }
};

export default verifyTokenMiddleware;
