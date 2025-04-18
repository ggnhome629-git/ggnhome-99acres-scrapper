const User = require("../models/user.model");

const fetchuserprofile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).populate("posts.post");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json(
            {
                user
            }
        )

    }
    catch (error) {
        return res.status(500).json({ message: "An error occurred.", error });
    }
}

const updateuserprofile = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // List of allowed fields to update
      if (req.file) {
        const uploaded = await uploadoncloudinary(req.file.path);
        user.profileimage = uploaded.url;
      }
      const { name, phone, bio, goals, github, linkedin } = req.body;
      const originalName = user.name;
  
      // Update fields
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.bio = bio || user.bio;
      user.goals = goals || user.goals;
      user.github = github || user.github;
      user.linkedin = linkedin || user.linkedin;
  
      // Check if the new username already exists (and is not the current user)
      if (name && name !== originalName) {
        const existingUser = await User.findOne({ name });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: "Username already taken." });
        }
      }

      try {
        await user.save();
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.name) {
          return res.status(400).json({ message: "Username already taken." });
        }
        throw err;
      }
  
      // Exclude password in response
      const { password, ...userWithoutPassword } = user.toObject();
  
      return res.status(200).json({
        message: "User updated successfully.",
        user: userWithoutPassword
      });
  
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "An error occurred.", error });
    }
};

const { uploadoncloudinary } = require("../config/FileHandling");

const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const image = req.file;
    if (!image) {
      return res.status(400).json({ message: "No profile image provided." });
    }

    const uploaded = await uploadoncloudinary(image.path);
    user.profileimage = uploaded.url;

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      message: "Profile image uploaded successfully.",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};

module.exports = {
    fetchuserprofile, updateuserprofile, uploadProfileImage
}