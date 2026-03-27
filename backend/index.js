require('dotenv').config();
const cors = require("cors");
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const configureDB = require('./config/db');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
configureDB();

const authCtlr = require('./app/controllers/auth-controller');
const agentCtlr = require('./app/controllers/agent-controller');
const authenticateUser = require('./app/middlewares/authenticate');
const userCtlr = require('./app/controllers/user-controller');
const packageCtlr = require('./app/controllers/package-controller');
const bookingCtlr = require('./app/controllers/booking-controller');
const verifyResetPass = require('./app/middlewares/verifyResetPass');
const authorizeUser = require('./app/middlewares/authorize');
const upload = require("./app/middlewares/upload");
require("./app/jobs/bookingCron");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

//register - user, agent 
app.post('/api/users/register', authCtlr.register);
app.post('/api/agents/register', agentCtlr.register);

//login - user, admin, agent
app.post('/api/login', authCtlr.login);

//To get logged-in user details
app.get('/api/users/account', authenticateUser, authCtlr.account);

//Update - User profile
app.put('/api/users/:userId', authenticateUser, userCtlr.userUpdate);

//Update - User, agent Password
app.put('/api/update-password/:userId', authenticateUser, userCtlr.updateUserPassword);

//Forgot password (before login)- User, agent 
app.post('/api/forgot-password', userCtlr.forgotPassword);

//Verify OTP(before login) - User, agent
app.post('/api/verifyOtp', userCtlr.verifyOtp);

//Reset - User, agent Password
app.put('/api/reset-password', verifyResetPass, userCtlr.resetPassword);

//Update - Agent
app.put("/api/agents/:agentId",authenticateUser, authorizeUser(["agent"]), agentCtlr.agentUpdate);

//Remove account - user
app.delete('/api/users/:userId', authenticateUser, authorizeUser(["user"]), userCtlr.removeUser);

//Remove account - agent
app.delete('/api/agents/:agentId', authenticateUser, authorizeUser(["agent"]), agentCtlr.removeAgent);

// //Create Itinerary 
// app.post('/api/create-package', authenticateUser, authorizeUser(['agent']),packageCtlr.createPackage);
// 'packageImages' is the key name, 5 is the limit
app.post('/api/create-package', authenticateUser, authorizeUser(['agent']), upload.array('packageImages', 5), packageCtlr.createPackage);
//approve an itinerary
app.patch('/api/approve-package/:packageId', authenticateUser,  authorizeUser(['admin']), packageCtlr.adminApprove);
//Bulk Approval of itineraries
app.patch('/api/package/bulk-approval', authenticateUser,  authorizeUser(['admin']), packageCtlr.adminBulkApprove);
//Reject an itinerary
app.patch('/api/reject-package/:packageId', authenticateUser,  authorizeUser(['admin']), packageCtlr.adminReject);
//Bulk Rejection of itineraries
app.patch('/api/package/bulk-rejection', authenticateUser,  authorizeUser(['admin']), packageCtlr.adminBulkReject);
//View the Itinerires
app.get('/api/view-package', authenticateUser, authorizeUser(['admin','agent','user']), packageCtlr.list);
//Update the Itinerary
app.put("/api/update-package/:packageId",authenticateUser, authorizeUser(["agent"]), packageCtlr.packageUpdate);
//Remove the Itinerary
app.delete("/api/remove-package/:packageId",authenticateUser, authorizeUser(["admin", "agent"]), packageCtlr.removePackage);
// Public list of packages (approved only)
app.get("/api/public-packages", packageCtlr.listPublic);


//create booking
app.post('/api/create-booking', authenticateUser, authorizeUser(['user']), bookingCtlr.createBooking);
//view booking
app.get('/api/view-booking', authenticateUser, authorizeUser(['user','agent','admin']), bookingCtlr.viewBooking);
//cancel booking
app.get('/api/cancel-booking', authenticateUser, authorizeUser(['admin']), bookingCtlr.cancelBooking);
//send email notification for booking cancellation
app.post(
  '/api/bookings/:id/cancel-request', authenticateUser, authorizeUser(["user"]), bookingCtlr.cancelRequest);


app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
})