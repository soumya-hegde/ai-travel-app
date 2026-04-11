const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  packageId: {
    type: Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true, // One review per booking
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

const Review = model("Review", reviewSchema);
module.exports = Review;