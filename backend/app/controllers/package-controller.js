const Package = require("../models/package-model");
const fs = require('fs');
const path = require('path'); 
const { packageValidationSchema } = require("../validators/validation");
const packageCtlr = {};

packageCtlr.createPackage = async (req, res) => {
  if (req.body.keyAttractions) {
    try {
      req.body.keyAttractions = JSON.parse(req.body.keyAttractions);
    } catch (e) {
      // If it's already an array or invalid JSON, ignore error
    }
  }
  const body = req.body;
  const { error, value } = await packageValidationSchema.validate(body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((err) => err.message) });
  }
  try {
    if (req.role !== "agent") {
      return res.status(403).json({
        message: "Only agents can create Itinerary",
      });
    }
    const package = new Package(value);

    package.createdBy = req.userId;
    package.status = "pending"; // always pending

    // handle image upload
    if (req.files && req.files.length > 0) {
       package.packageImages = req.files.map(file => file.filename);
    }

    await package.save();

    res.status(201).json({
      message: "Itinerary created and pending approval",
      package: package,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
};

//single record approval
packageCtlr.adminApprove = async (req, res) => {
  try {
    //Only admin can approve
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const package = await Package.findByIdAndUpdate(
      req.params.packageId,
      {
        status: "approved",
        approvedBy: req.userId,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!package) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.json({
      message: "Itinerary approved successfully",
      package: package,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// single record rejection
packageCtlr.adminReject = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Request body required" });
    }
    const { rejectionReason } = req.body;
    const package = await Package.findByIdAndUpdate(
      req.params.packageId,
      {
        status: "rejected",
        rejectedBy: req.userId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || "Not specified",
      },
      { new: true }
    );

    if (!package) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.json({
      message: "Created Itinerary rejected",
      package: package,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!!!" });
  }
};

//bulk Approval
packageCtlr.adminBulkApprove = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Request body required" });
    }
    const { packageIds } = req.body;

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({
        message: "Itinerary IDs array is required",
      });
    }
    //$in : Match any document where the field value exists inside this array

    const result = await Package.updateMany(
      { _id: { $in: packageIds } }, //here packageIds is array
      {
        $set: {
          status: "approved",
          approvedBy: req.userId,
          approvedAt: new Date(),
        },
      }
    );

    res.json({
      message: "Itinerary approved successfully",
      modifiedCount: result.modifiedCount, // comes from updateMany
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//Bulk reject
packageCtlr.adminBulkReject = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!req.body) {
      return res.status(400).json({ message: "Request body required" });
    }
    const { packageIds, rejectionReason } = req.body;

    if (!Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({
        message: "Itinerary IDs array is required",
      });
    }

    const result = await Package.updateMany(
      { _id: { $in: packageIds } },
      {
        $set: {
          //$set in updateMany to update specific fields
          status: "rejected",
          rejectedBy: req.userId,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || "Not specified",
        },
      }
    );

    res.json({
      message: "Itinerary rejected successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!!!" });
  }
};

// View itineraries (Users view approved ones; Admin/Agent see all)
packageCtlr.list = async (req, res) => {
  try {
    let packages;
    if (req.role == "user") {
      packages = await Package.find({ status: "approved" })
        .populate("createdBy", "username"); // Added populate
    } else {
      packages = await Package.find()
        .populate("createdBy", "username"); // Added populate
    }
    res.json(packages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong!!!" });
  }
};

//update the Itinerary
packageCtlr.packageUpdate = async (req, res) => {
  try {
    if (req.role !== "agent") {
      return res.status(403).json({ message: "Only agents can update itineraries" });
    }
    
    if (req.body.keyAttractions && typeof req.body.keyAttractions === 'string') {
        try {
          req.body.keyAttractions = JSON.parse(req.body.keyAttractions);
        } catch (e) {
          console.log("Error parsing attractions string");
        }
    }

    const packageId = req.params.packageId;
    const agentId = req.userId;
    const package = await Package.findById(packageId);

    if (!package) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    if (package.createdBy.toString() !== agentId) {
      return res.status(403).json({ message: "You are not allowed to update this itinerary" });
    }

    const allowedFields = [
      "packageName", "packageDescription", "packageDestination",
      "packageDays", "packageNights", "packageAccommodation",
      "packageTransportation", "packageMeals", "packageActivities",
      "packagePrice", "packageDiscountPrice", "packageOffer", "keyAttractions",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    //Handle new image uploads during update
    if (req.files && req.files.length > 0) {
      updateData.packageImages = req.files.map(file => file.filename);
    }

    updateData.status = "pending"; // Reset for re-approval
    // Clear previous admin logs
    updateData.approvedBy = null;
    updateData.approvedAt = null;
    updateData.rejectedBy = null;
    updateData.rejectedAt = null;
    updateData.rejectionReason = null;

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Itinerary updated successfully and sent for re-approval",
      package: updatedPackage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//Remove the Itinerary
packageCtlr.removePackage = async (req, res) => {
  try {
    const packageId = req.params.packageId;
    const agentId = req.userId;

    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ message: "Itinerary not found!!!" });
    }

    // Role check
    const isAdmin = req.role === "admin";
    const isOwner = req.role === "agent" && package.createdBy.toString() === agentId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access Denied" });
    }

    if (req.role === "agent" && package.status === "approved") {
      return res.status(403).json({ message: "Approved itineraries cannot be removed by agents." });
    }

    // Cleanup images for BOTH Admin and Agent deletion
    if (package.packageImages && package.packageImages.length > 0) {
      package.packageImages.forEach(filename => {
        if (!filename.startsWith('http')) {
          const filePath = path.join(__dirname, '../../uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await Package.findByIdAndDelete(packageId);
    res.json({ message: "Itinerary and images removed successfully." });

  } catch (err) {
    res.status(500).json({ error: "something went wrong!!!" });
  }
};

packageCtlr.listPublic = async (req, res) => {
  try {
    const packages = await Package.find({ status: "approved" });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = packageCtlr;

/*Note: 
You don’t need $set because findByIdAndUpdate automatically treats the object you pass as fields to set.
If you pass a plain object like this to updateMany, MongoDB may treat it as a replacement document instead of updating fields.
That means it could replace the entire document, potentially erasing fields like _id, createdAt, etc.

runValidators: true ensures that Mongoose schema validations are enforced during update operations.*/
