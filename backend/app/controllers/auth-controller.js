const User = require("../models/user-model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  userRegistrationValidationSchema,
  userLoginValidationSchema,
} = require("../validators/validation");
const authCtlr = {};

// admin, user register
authCtlr.register = async (req, res) => {
  const body = req.body;
  const { error, value } = userRegistrationValidationSchema.validate(body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((err) => err.message) });
  }
  const emailPresent = await User.findOne({ email: value.email });
  try {
    if (emailPresent) {
      return res.status(400).json({ error: "Email already taken" });
    }
    const user = new User(value);
    const salt = await bcryptjs.genSalt();
    const hashPassword = await bcryptjs.hash(value.password, salt);
    user.password = hashPassword;
    const userCount = await User.countDocuments();
    if (userCount == 0) {
      user.role = "admin";
    }
    await user.save();
    res.status(201).json({ message: "Successfully Registered!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong!" });
  }
};

// admin, agent, user -login
authCtlr.login = async (req, res) => {
  const body = req.body;
  const { value, error } = userLoginValidationSchema.validate(body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(500)
      .json({ error: error.details.map((err) => err.message) });
  }
  const userPresent = await User.findOne({ email: value.email });
  if (!userPresent) {
    return res.status(500).json({ error: "Invalid Email" });
  }
  const isPasswordMatch = await bcryptjs.compare(
    value.password,
    userPresent.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ error: "Invalid Password!" });
  }
  const tokenData = { userId: userPresent._id, role: userPresent.role };
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  res.json({ token: token });
};

//profile details
authCtlr.account = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = authCtlr;
