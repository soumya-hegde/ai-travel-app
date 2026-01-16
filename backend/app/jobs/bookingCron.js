const cron = require("node-cron");
const Booking = require("../models/booking-model");

// Core logic (single source of truth)
const markCompletedBookings = async () => {
  try {
    console.log("Booking cron executed at:", new Date());

    const result = await Booking.updateMany(
      {
        travelDate: { $lt: new Date() },
        status: "confirmed"
      },
      {
        status: "completed"
      }
    );

    console.log(
      `Bookings matched: ${result.matchedCount}, updated: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error("Booking cron error:", error.message);
  }
};

// Run ONCE when server starts
markCompletedBookings();

// Run EVERY DAY at 12:00 AM
cron.schedule("0 0 * * *",
  markCompletedBookings,
  {
    timezone: "Asia/Kolkata"
  }
);
