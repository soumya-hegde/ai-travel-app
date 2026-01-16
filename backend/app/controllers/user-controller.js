const User = require("../models/user-model");
const bcryptjs = require("bcryptjs");
const {
  userUpdateValidationSchema,
  changePasswordValidationSchema,
  resetPasswordValidationSchema,
} = require("../validators/validation");
//const sendOtpToEmail = require("../utils/sendOtp"); // your email function
const Otp = require("../models/otp-model"); // if storing OTP in DB
const jwt = require("jsonwebtoken");
const userCtlr = {};

//Update the user
userCtlr.userUpdate = async (req, res) => {
  const body = req.body;
  const { error, value } = userUpdateValidationSchema.validate(body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((err) => err.message) });
  }
  const { username, email } = value; //destructuring
  const userId = req.params.userId;
  if (req.userId !== userId) {
    return res
      .status(401)
      .json({
        success: false,
        message: "You can only update your own account please login again!",
      });
  }
  try {
    const userUpdatedFields = { username, email }; //consise properties - {username:username, email:email}

    //remove undefined - incase user updated username/email
    Object.keys(userUpdatedFields).forEach((key) => {
      if (userUpdatedFields[key] == undefined) {
        delete userUpdatedFields[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userUpdatedFields },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password, runValidators: true -if the duplicate emails are there it should goto catch block
    res
      .status(201)
      .json({ success: true, message: "User Details Updated Successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(200)
        .json({ success: true, message: "Email already taken, please login!" });
    }
    console.log(error);
    res.status(500).json({ err: "something went wrong while updating user!" });
  }
};

//update password
// update user password
userCtlr.updateUserPassword = async (req, res) => {
  try {
    const userIdFromToken = req.userId;
    const userIdFromParams = req.params.userId;
    const body = req.body;

    const { error, value } = changePasswordValidationSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((err) => err.message) });
    }

    if (userIdFromToken !== userIdFromParams) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized! You can only update your own password.",
      });
    }

    const user = await User.findById(userIdFromParams);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isValidOld = await bcryptjs.compare(oldPassword, user.password);
    if (!isValidOld) {
      return res.status(400).send({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await User.findByIdAndUpdate(
      userIdFromParams,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return res.status(201).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "Server error while updating password",
    });
  }
};

//forgot password - before login
userCtlr.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt();
    const hashedOtp = await bcryptjs.hash(otp, salt);

    // Store OTP in DB
    await Otp.create({
      userId: user._id,
      otp: hashedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Send OTP to email
    //await sendOtpToEmail(email, otp);
    console.log("OTP for", email, ":", otp);

    return res.status(200).send({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      success: false,
      message: "Server error in forgot password",
    });
  }
};

userCtlr.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otpRecord = await Otp.findOne({
      userId: user._id,
      expiresAt: { $gt: Date.now() },
    });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isOtpValid = await bcryptjs.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({ userId: user._id });

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_SECRET,
      { expiresIn: "10m" }
    );

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ message: "Server Error!" });
  }
};

//Reset the password
userCtlr.resetPassword = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = resetPasswordValidationSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((err) => err.message) });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const salt = await bcryptjs.genSalt();
    user.password = await bcryptjs.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

userCtlr.removeUser = async (req, res) => {
  const userId = req.params.userId;

  if (req.userId !== userId) {
    return res.status(403).json({
      message: "You can delete only your own user account",
    });
  }
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({});
    }
    res.json({ message: "Your user account is deleted", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong!!!" });
  }
};

module.exports = userCtlr;
