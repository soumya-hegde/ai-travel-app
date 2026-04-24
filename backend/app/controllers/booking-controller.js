const Booking = require("../models/booking-model");
const Package = require("../models/package-model");
const sendMail = require("../utils/mailer");
const { bookingValidationSchema } = require("../validators/validation");
const bcryptjs = require("bcryptjs");
const bookingCtlr = {};
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

bookingCtlr.createBooking = async (req, res) => {
  try {
    const body = req.body;
    const { error, value } = bookingValidationSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((err) => err.message) });
    }

    if (req.role !== "user") {
      return res.status(403).json({ message: "Only users can book tours" });
    }

    if (!value || Object.keys(value).length === 0) {
      return res.status(400).json({
        message: "Request body is required",
      });
    }

    const { packageId, travelDate } = value;

    const package = await Package.findOne({
      _id: packageId,
      status: "approved",
    });

    if (!package) {
      return res
        .status(400)
        .json({ message: "Package not available for booking" });
    }

    const existingBooking = await Booking.findOne({
      userId: req.userId,
      packageId,
      travelDate,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "You already booked this package for this date",
      });
    }

    const booking = new Booking({
      userId: req.userId,
      agentId: package.createdBy,
      packageId,
      travelDate,
      totalAmount: package.packagePrice,
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
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "username email")
      .populate("agentId", "username email")
      .populate("packageId", "packageName packageDestination packagePrice")
      .sort({ createdAt: -1 });

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

bookingCtlr.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (req.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can cancel bookings",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking already cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancelledBy = "admin";
    booking.cancelledAt = new Date();
    booking.paymentStatus = booking.paymentStatus || "paid";

    await booking.save();

    return res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



bookingCtlr.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: "Reason is required" });
    }

    const booking = await Booking.findById(id)
      .populate("userId", "username email")
      .populate("packageId", "packageName packageDestination");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const text = `
Cancellation request received

Requested By:
- Name: ${booking.userId?.username}
- Email: ${booking.userId?.email}

Booking Details:
- Booking ID: ${booking._id}
- Package: ${booking.packageId?.packageName}
- Destination: ${booking.packageId?.packageDestination}
- Travel Date: ${booking.travelDate}
Reason:
${reason}`;
    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: "Cancel Booking Request",
      text,
      replyTo: booking.userId?.email,
    });

    return res.json({ message: "Cancel request sent to admin" });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};



// 1. Create Order
bookingCtlr.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; 

    // Validation: ensure amount exists and is a number
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert INR to Paise (integer)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("RAZORPAY ERROR:", err); // This shows the real error in your terminal
    res.status(500).json({ error: err.message });
  }
};

// 2. Verify Payment and Create Booking
bookingCtlr.verifyAndBook = async (req, res) => {
  try {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        packageId,
        travelDate,
        totalAmount
    } = req.body;

    // Verify Signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // If verified, save booking to DB
    const packageData = await Package.findById(packageId);
    
    const booking = new Booking({
      userId: req.userId,
      agentId: packageData.createdBy,
      packageId,
      travelDate,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      status: 'confirmed'
    });

    await booking.save();
    res.status(201).json({ message: "Payment successful and booking confirmed", booking });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = bookingCtlr;
