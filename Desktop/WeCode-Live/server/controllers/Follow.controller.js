const Follow = require("../models/Follow.model");
const User = require("../models/user.model");

const FollowUser = async (req, res) => {
  try {
    const { following_name, followed_name } = req.body;

    // Fetch users by name
    const followingUser = await User.findOne({ name: following_name });
    const followedUser = await User.findOne({ name: followed_name });

    if ( !followedUser) {
      return res.status(404).json({ message: "One or both users not found." });
    }

    if (followingUser._id.equals(followedUser._id)) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const existingFollow = await Follow.findOne({
      following_id: followingUser._id,
      followed_id: followedUser._id,
    });

    if (existingFollow) {
      return res.status(409).json({ message: "Already following this user." });
    }

    const follow = new Follow({
      following_id: followingUser._id,
      followed_id: followedUser._id,
    });

    await follow.save();
    return res.status(200).json({ message: `Now following ${followed_name}` });

  } catch (error) {
    console.error("❌ Error in FollowUser:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const CheckFollowing = async (req, res) => {
  try {
    const { following_name, followed_name } = req.body;
  const followingUser = await User.findOne({ name: following_name });
  const followedUser = await User.findOne({ name: followed_name });

  if (!followingUser || !followedUser) {
    return res.status(400).json({ isFollowing: false });
  }

  const isFollowing = await Follow.exists({
    following_id: followingUser._id,
    followed_id: followedUser._id,
  });

  res.json({ isFollowing: !!isFollowing });
  }
  catch (error) {
    console.error("❌ Error in CheckFollowing:", error);
    return res.status(500).json({ message: "Server error." });
  }
}

const UnfollowUser = async (req, res) => {
  try {
    const { following_name, followed_name } = req.body;

    // Search for the user we want to unfollow 
    const followingUser = await User.findOne({ name: following_name });
    const followedUser = await User.findOne({ name: followed_name });

    if (!followedUser) {
      return res.status(404).json({ message: "followed user not found." });
    }

    if (followingUser._id.equals(followedUser._id)) {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }

    const existingFollow = await Follow.findOne({
      following_id: followingUser._id,
      followed_id: followedUser._id,
    });

    if (!existingFollow) {
      return res.status(404).json({ message: "You are not following this user." });
    }

    await Follow.deleteOne({
      following_id: followingUser._id,
      followed_id: followedUser._id,
    });

    return res.status(200).json({ message: `Unfollowed ${followed_name}` });
  } catch (error) {
    console.error("❌ Error in UnfollowUser:", error);
    return res.status(500).json({ message: "Server error." });
  }
}

const SearchUser = async (req, res) => {
  const { searchQuery } = req.query;

  if (!searchQuery || searchQuery.trim() === "") {
    return res.status(400).json({ message: "Search query is required." });
  }

  try {
    const users = await User.find({
      name: { $regex: searchQuery.trim(), $options: "i" }
    }).select("name");

    return res.status(200).json({ users });
  } catch (error) {
    console.error("❌ Error in SearchUser:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const FollowDashboard = async (req, res) => {
  try {
    const following_count = await Follow.countDocuments({ following_id: req.user._id });
    const followed_count = await Follow.countDocuments({ followed_id: req.user._id });
    const Followers_user_names = await Follow.find({ followed_id: req.user._id }).populate("following_id", "name");
    const Following_user_names = await Follow.find({ following_id: req.user._id }).populate("followed_id", "name");
    return res.status(200).json({ following_count, followed_count , Followers_user_names, Following_user_names });
  } catch (error) {
    console.error("❌ Error in FollowDashboard:", error);
    return res.status(500).json({ message: "Server error." });
  }
}

module.exports = { FollowUser ,CheckFollowing, UnfollowUser, SearchUser , FollowDashboard };