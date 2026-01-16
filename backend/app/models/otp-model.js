const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const otpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const Otp = model("Otp", otpSchema);
module.exports = Otp;
