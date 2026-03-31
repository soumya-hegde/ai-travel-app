const Joi = require('joi');
const userRegistrationValidationSchema = Joi.object({
    username:Joi.string().trim().min(3).required(),
    email:Joi.string().trim().email().required(),
    password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .message('Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.')
    .required()
})

const userLoginValidationSchema = Joi.object({
    email:Joi.string().trim().email().required(),
    password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .message('Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.')
    .required()
});

const agentRegisterValidationSchema = Joi.object({
    username:Joi.string().trim().min(3).required(),
    email:Joi.string().trim().email().required(),
    password: Joi.string()
    .min(8)
    .max(128).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .message('Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.')
    .required(),
    agencyName: Joi.string().trim().min(3).required(),
    phone: Joi.string().trim().pattern(/^[0-9]{10}$/)
    .message("Phone number must be exactly 10 digits.")
    .required(),
    address: Joi.string().trim().min(5).required()
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
    "array.min": "Please add at least one key attraction"
  }),
});

const changePasswordValidationSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .message(
      'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
    )
    .required()
});

const userUpdateValidationSchema = Joi.object({
  username: Joi.string().trim().min(3).optional(),
  email: Joi.string().trim().email().optional()
}).min(1); // at least one field must be present

const resetPasswordValidationSchema = Joi.object({
  newPassword: Joi.string().min(8).max(128)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .message(
      'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
    )
    .required()
});

const bookingValidationSchema = Joi.object({
  packageId: Joi.string().required(),
  travelDate: Joi.date().greater("now").required().messages({
    "date.base": "Invalid Package ID format"
  })
});

module.exports = {
    userRegistrationValidationSchema,
    userLoginValidationSchema,
    agentRegisterValidationSchema,
    packageValidationSchema,
    changePasswordValidationSchema,
    userUpdateValidationSchema,
    resetPasswordValidationSchema,
    bookingValidationSchema
}