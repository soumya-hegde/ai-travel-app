const User = require("../models/user-model");
const bcryptjs = require("bcryptjs");
const {
  agentRegisterValidationSchema,
  agentUpdateValidationSchema,
} = require("../validators/validation");


const agentCtlr = {};

agentCtlr.register = async (req, res) => {
  const body = req.body;
  const { error, value } = await agentRegisterValidationSchema.validate(body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(500)
      .json({ error: error.details.map((err) => err.message) });
  }

  try {
    // Check if email exists
    const existingEmail = await User.findOne({ email: value.email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already taken" });
    }

    // Create agent
    const agent = new User(value);
    agent.role = "agent";

    const salt = await bcryptjs.genSalt();
    agent.password = await bcryptjs.hash(agent.password, salt);

    await agent.save();
    res.status(201).json({ message: "Agent registered successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

//Update the agent
agentCtlr.agentUpdate = async (req, res) => {
  const agentId = req.params.agentId;

  if (req.userId !== agentId) {
    return res.status(401).json({
      success: false,
      message: "You can only update your own account. Please log in again.",
    });
  }

  const { error, value } = await agentUpdateValidationSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details.map((err) => err.message),
    });
  }

  try {
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    const { username, agencyName, phone, address } = value;

    const userUpdatedFields = { username, agencyName, phone, address };

    Object.keys(userUpdatedFields).forEach((key) => {
      if (userUpdatedFields[key] === undefined) {
        delete userUpdatedFields[key];
      }
    });

    await User.findByIdAndUpdate(
      agentId,
      { $set: userUpdatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the profile",
    });
  }
};




agentCtlr.removeAgent = async (req, res) => {
  const agentId = req.params.agentId;
  const body = req.body;
  if (req.userId !== agentId) {
    return res.status(403).json({
      message: "You can delete only your own agent account",
    });
  }
  try {
    const agent = await User.findByIdAndDelete(agentId);
    if (!agent) {
      return res.status(404).json({});
    }
    res.json({ message: "Your agent account is deleted", agent });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong!!!" });
  }
};

module.exports = agentCtlr;
