import Joi from "joi";

export const userSchema = {
  POST: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().required(),
    password: Joi.string().alphanum().min(8).max(12).required(),
    role: Joi.string().alphanum().required(),
  }),
  LOGIN: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().alphanum().min(8).max(12).required(),
  }),
  PUT: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().alphanum().min(8).max(12).optional(),
  }),
};

export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().alphanum().min(8).max(12).required(),
});
