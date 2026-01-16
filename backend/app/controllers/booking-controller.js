const Booking = require('../models/booking-model');
const Package = require('../models/package-model');
const { bookingValidationSchema } = require('../validators/validation')
const bcryptjs = require('bcryptjs');
const bookingCtlr = {};

bookingCtlr.createBooking = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = bookingValidationSchema.validate(body, {abortEarly:false});
    if(error){
        return res.status(400).json({error:error.details.map(err => err.message)});
    }
    
    if (req.role !== "user") {
      return res.status(403).json({ message: "Only users can book tours" });
    }

    if (!value || Object.keys(value).length === 0) {
        return res.status(400).json({
            message: "Request body is required"
        });
    }

    const { packageId, travelDate } = value;

    const package = await Package.findOne({
      _id: packageId,
      status: "approved"
    });

    if (!package) {
      return res.status(400).json({ message: "Package not available for booking" });
    }

    const existingBooking = await Booking.findOne({
      userId: req.userId,
      packageId,
      travelDate,
      status: { $ne: "cancelled" }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "You already booked this package for this date"
      });
    }

    const booking = new Booking({
      userId: req.userId,
      agentId: package.createdBy,
      packageId,
      travelDate,
      totalAmount: package.packageDiscountPrice || package.packagePrice
    });

    await booking.save();
    res.status(201).json(booking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

bookingCtlr.viewBooking = async (req, res) => {
  try {
    let filter = {};

    // USER : only their bookings
    if (req.role === "user") {
      filter.userId = req.userId;
    }

    // AGENT : bookings for packages they created
    else if (req.role === "agent") {
      filter.agentId = req.userId;
    }

    // ADMIN : sees all bookings
    else if (req.role === "admin") {
      filter = {};
    }

    else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "username email")
      .populate("agentId", "username email")
      .populate("packageId", "packageName packageDestination")
      .sort({ createdAt: -1 });

    res.json({
      count: bookings.length,
      bookings
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

bookingCtlr.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can cancel bookings"
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled"
      });
    }

    booking.status = "cancelled";
    booking.cancelledBy = "admin";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({ message: "Booking cancelled successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = bookingCtlr;