import sendEmail from "../utils/emailService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const staffInvitation = asyncHandler(async (req, res, next) => {
  const { to, text } = req.body;

  if (!to || !text) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  const from = 'snaptask@outlook.com';
  const subject = 'SnapTask Invitation';

  const email = await sendEmail(from, to, subject, text);

  res.status(200).json({ message: 'Email sent successfully', email });
});
