const Joi = require("joi");

const passwordRule = Joi.string()
  .min(8)
  .max(128)
  .pattern(
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    )
  )
  .required()
  .messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must not exceed 128 characters",
    "string.pattern.base":
      "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
    "any.required": "Password is required",
  });

const emailRule = Joi.string().trim().email().required().messages({
  "string.empty": "Email is required",
  "string.email": "Email must be a valid email",
  "any.required": "Email is required",
});

const userRegistrationValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "any.required": "Username is required",
  }),
  email: emailRule,
  password: passwordRule,
});

const userLoginValidationSchema = Joi.object({
  email: emailRule,
  password: passwordRule,
});

const agentRegisterValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "any.required": "Username is required",
  }),
  email: emailRule,
  password: passwordRule,
  agencyName: Joi.string().trim().min(3).required().messages({
    "string.empty": "Agency name is required",
    "string.min": "Agency name must be at least 3 characters",
    "any.required": "Agency name is required",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "any.required": "Phone number is required",
    }),
  address: Joi.string().trim().min(5).required().messages({
    "string.empty": "Address is required",
    "string.min": "Address must be at least 5 characters",
    "any.required": "Address is required",
  }),
});

const packageValidationSchema = Joi.object({
  packageName: Joi.string().trim().min(3).max(100).required(),
  packageDescription: Joi.string().trim().min(10).required(),
  packageDestination: Joi.string().trim().min(3).required(),
  packageDays: Joi.number().integer().min(1).required(),
  packageNights: Joi.number().integer().min(0).required(),
  packageAccommodation: Joi.string().trim().required(),
  packageTransportation: Joi.string().trim().required(),
  packageMeals: Joi.string().trim().required(),
  packageActivities: Joi.string().trim().required(),
  packagePrice: Joi.number().positive().required(),
  packageDiscountPrice: Joi.number().min(0).less(Joi.ref("packagePrice")).required(),
  packageOffer: Joi.boolean().required(),
  packageRating: Joi.number().min(0).max(5).optional(),
  packageTotalRatings: Joi.number().integer().min(0).optional(),
  packageImages: Joi.array().items(Joi.string().uri()).optional(),
  keyAttractions: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    "array.min": "Please add at least one key attraction",
  }),
});

const changePasswordValidationSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old password is required",
    "any.required": "Old password is required",
  }),
  newPassword: passwordRule,
});

const userUpdateValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).optional(),
  email: Joi.string().trim().email().optional(),
}).min(1);

const resetPasswordValidationSchema = Joi.object({
  newPassword: passwordRule,
});

const bookingValidationSchema = Joi.object({
  packageId: Joi.string().required(),
  travelDate: Joi.date().greater("now").required().messages({
    "date.base": "Invalid travel date",
  }),
});

const agentUpdateValidationSchema = Joi.object({
  username: Joi.string().trim().min(1).max(50),
  agencyName: Joi.string().trim().min(1).max(100),
  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      "string.pattern.base": "Enter a valid 10-digit phone number",
    }),
  address: Joi.string().trim().min(1).max(300),
}).min(1);

module.exports = {
  userRegistrationValidationSchema,
  userLoginValidationSchema,
  agentRegisterValidationSchema,
  packageValidationSchema,
  changePasswordValidationSchema,
  userUpdateValidationSchema,
  resetPasswordValidationSchema,
  bookingValidationSchema,
  agentUpdateValidationSchema,
};
