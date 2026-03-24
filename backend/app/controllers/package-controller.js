const Package = require("../models/package-model");
const { packageValidationSchema } = require("../validators/validation");
const packageCtlr = {};

packageCtlr.createPackage = async (req, res) => {
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
    if (req.file) {
      package.image = req.file.path;
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
    let package;
    if (req.role == "user") {
      package = await Package.find({ status: "approved" });
    } else {
      package = await Package.find();
    }
    res.json(package);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong!!!" });
  }
};

//update the Itinerary
packageCtlr.packageUpdate = async (req, res) => {
  try {
    if (req.role !== "agent") {
      return res
        .status(403)
        .json({ message: "Only agents can update itineraries" });
    }

    const packageId = req.params.packageId;
    const agentId = req.userId;

    const package = await Package.findById(packageId);

    if (!package) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    if (package.createdBy.toString() !== agentId) {
      return res.status(403).json({
        message: "You are not allowed to update this itinerary",
      });
    }

    //Update allowed fields only
    // const updatedPkg = await Package.findByIdAndUpdate(
    //   packageId,
    //   {
    //     ...req.body,
    //     status: "pending",        // reset approval
    //     approvedBy: null,
    //     approvedAt: null,
    //     rejectedBy: null,
    //     rejectedAt: null,
    //     rejectionReason: null
    //   },
    //   { new: true, runValidators: true }
    // );

    const allowedFields = [
      "packageName",
      "packageDescription",
      "packageDestination",
      "packageDays",
      "packageNights",
      "packageAccommodation",
      "packageTransportation",
      "packageMeals",
      "packageActivities",
      "packagePrice",
      "packageDiscountPrice",
      "packageOffer",
      "packageImages",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    updateData.status = "pending";
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
    if (Object.keys(updateData).length === 6) {
      // only approval reset fields
      return res.status(400).json({
        message: "At least one field must be updated",
      });
    }

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
    //
    if (req.role === "admin") {
      await Package.findByIdAndDelete(packageId);
      return res.json({ message: "Itinerary removed by admin" });
    }
    //check loggedin agentId is same as agentId who created the package
    if (req.role === "agent") {
      if (package.createdBy.toString() !== agentId) {
        return res
          .status(403)
          .json({ message: "You are not allowed to delete this itinerary" });
      }

      if (package.status === "approved") {
        return res
          .status(403)
          .json({ message: "Approved itineraries cannot be removed." });
      }

      await Package.findByIdAndDelete(packageId);
      return res.json({ message: "Itinerary removed successfully." });
    }

    return res.status(403).json({ message: "Access Denied" });
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
