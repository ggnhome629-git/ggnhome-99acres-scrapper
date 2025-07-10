const User = require("../models/User.Model");
const sendEmail = require("../middleware/EmailVerify");

// This comes from a form data
const registerUser = async (req, res) => {
  try {
    const { name, contact } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = new User({ name, contact });
    await sendEmail(
  process.env.EMAIL_USER,
  "📥 New Property Lead Received",
  `You have a new potential customer inquiry:\n\n👤 Name: ${name}\n📞 Contact: ${contact}\n\nPlease reach out to assist them with available plots.`
);
    await user.save();
    res.json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const markPreferredPlot = async (req, res) => {
  try {
    const { userId, plotId } = req.body;

    if (!userId || !plotId) {
      return res.status(400).json({ message: "userId and plotId are required" });
    }

    const updated = await User.findByIdAndUpdate(userId, {
      $addToSet: { preferredPlots: plotId }
    }, { new: true });

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Plot added to user preferences", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update preference." });
  }
};
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve user." });
  }
};

module.exports = {
  registerUser,
    markPreferredPlot,
    getUser
};
