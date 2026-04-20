const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    cancelledBy: {
      type: String,
      enum: ["admin", "system"],
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    }
    },
  { timestamps: true }
);

const Booking = model("Booking", bookingSchema);
module.exports = Booking;
