const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const packageSchema = new Schema(
  {
    packageName: {
      type: String,
      required: true,
    },
    packageDescription: {
      type: String,
      required: true,
    },
    packageDestination: {
      type: String,
      required: true,
    },
    packageDays: {
      type: Number,
      required: true,
    },
    packageNights: {
      type: Number,
      required: true,
    },
    packageAccommodation: {
      type: String,
      required: true,
    },
    packageTransportation: {
      type: String,
      required: true,
    },
    packageMeals: {
      type: String,
      required: true,
    },
    packageActivities: {
      type: String,
      required: true,
    },
    packagePrice: {
      type: Number,
      required: true,
    },
    packageDiscountPrice: {
      type: Number,
      required: true,
    },
    packageOffer: {
      type: Boolean,
      required: true,
    },
    packageRating: {
      type: Number,
      default: 0,
    },
    packageTotalRatings: {
      type: Number,
      default: 0,
    },
    packageImages: {
      type: Array,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: Date,

    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    rejectedAt: Date,

    rejectionReason: {
      type: String
    },
    keyAttractions: {
      type: [String], // Array of strings: ["Baga Beach", "Fort Aguada", "Dudhsagar Falls"]
      required: true
    }
  },
  { timestamps: true }
);

const Package = model("Package", packageSchema);

module.exports = Package;
