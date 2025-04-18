const { uploadoncloudinary } = require("../config/FileHandling");
const Post = require("../models/post.model");
const User = require("../models/user.model");


const postcontroller = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description } = req.body;
    const images = req.files?.posts || [];

    if (images.length === 0) {
      return res.status(400).json({ message: "No images provided." });
    }

    const createdPosts = [];

    for (const image of images) {
      const uploaded = await uploadoncloudinary(image.path);

      const newPost = await Post.create({
        user: userId,
        title,
        description,
        mediaUrl: uploaded.url,
        mediaType: uploaded.resource_type || "image",
      });

      await User.findByIdAndUpdate(userId, {
        $push: {
          posts: {
            post: newPost._id,
            caption: description || "",
          },
        },
      });

      createdPosts.push(newPost);
    }
    // This keeps a track of the recently uploaded posts done by users
    const updatedUser = await User.findById(userId).populate("posts.post");
    res.status(201).json({ posts: createdPosts, user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const Feedcontroller = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followingUserIds = user.following.map((followed) => followed._id.toString());
    followingUserIds.push(userId); // include own posts in feed

    const posts = await Post.find({ user: { $in: followingUserIds } })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { postcontroller , Feedcontroller };
