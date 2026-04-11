const Review = require("../models/review-model");
const Package = require("../models/package-model");
const Booking = require("../models/booking-model");

const reviewCtlr = {};

reviewCtlr.create = async (req, res) => {
  try {
    const { packageId, bookingId, rating, comment } = req.body;

    // 1. Verify the booking belongs to this user and is 'completed'
    const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ error: "You can only review completed trips" });
    }

    // 2. Check if already reviewed
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this trip" });
    }

    // 3. Save the review
    const review = new Review({
      userId: req.userId,
      packageId,
      bookingId,
      rating,
      comment,
    });
    await review.save();

    // 4. Recalculate Package Average Rating
    const reviews = await Review.find({ packageId });
    const totalRatings = reviews.length;
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

    await Package.findByIdAndUpdate(packageId, {
      packageRating: avgRating.toFixed(1),
      packageTotalRatings: totalRatings,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all reviews for a specific package
reviewCtlr.listByPackage = async (req, res) => {
  try {
    const reviews = await Review.find({ packageId: req.params.packageId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = reviewCtlr;