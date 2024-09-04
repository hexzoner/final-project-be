import Joi from "joi";

export const userSchema = {
  POST: Joi.object({
    firstName: Joi.string().allow("").optional(),
    lastName: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    email: Joi.string().required(),
    password: Joi.string().min(4).max(12).required(),
    role: Joi.string().required(),
  }),
  LOGIN: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(4).max(12).required(),
  }),
  PUT: Joi.object({
    firstName: Joi.string().allow("").optional(),
    lastName: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    email: Joi.string().optional(),
    password: Joi.string().min(4).max(12).optional(),
    newPassword: Joi.string().min(4).max(12).allow("").optional(),
    currentPassword: Joi.string().min(4).max(12).allow("").optional(),
    role: Joi.string().optional(),
  }),
};

export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(4).max(12).required(),
});

export const taskSchema = {
  POST: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    dueDate: Joi.date().required(),
    priority: Joi.string().required(),
    status: Joi.string().default("New").optional(),
    area: Joi.string().required(),
    assignedTo: Joi.array().items(Joi.string()).optional(),
    finishedDate: Joi.date().optional(),
    steps: Joi.array()
      .items(
        Joi.object().keys({
          description: Joi.string().required(),
          isCompleted: Joi.boolean().optional().default(false),
        })
      )
      .optional(),
  }),
  PUT: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().allow("").optional(),
    dueDate: Joi.date().optional(),
    priority: Joi.string().optional(),
    status: Joi.string().optional(),
    assignedTo: Joi.array().items(Joi.string()).optional(),
    area: Joi.string().optional(),
    steps: Joi.array()
      .items(
        Joi.object().keys({
          _id: Joi.string().optional(),
          description: Joi.string().required(),
          isCompleted: Joi.boolean().optional(),
        })
      )
      .optional(),
  }),
};

export const areaSchema = {
  POST: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().allow("").optional(),
    contact: Joi.string().allow("").optional(),
    creator: Joi.string().required(),
    users: Joi.array().items(Joi.string()).optional(),
  }),
  PUT: Joi.object({
    name: Joi.string().optional(),
    address: Joi.string().allow("").optional(),
    contact: Joi.string().allow("").optional(),
    creator: Joi.string().optional(),
    users: Joi.array().items(Joi.string()).optional(),
  }),
};
