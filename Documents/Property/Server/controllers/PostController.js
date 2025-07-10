const { uploadoncloudinary } = require("../config/FileHandling");
const Post = require("../models/post.model");

const postController = async (req, res) => {
  try {
    const { price, pricePerSqFt, area, size, locality, tags, featured, preferred, address, status } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];

    for (const file of req.files.posts) {
      const result = await uploadoncloudinary(file.path);
      imageUrls.push(result.secure_url);
    }

    const newPost = new Post({
      image: imageUrls,
      price: Number(price),
      pricePerSqFt: Number(pricePerSqFt),
      area: Number(area),
      size: Number(size),
      locality,
      tags: typeof tags === "string" ? tags.split(",").map(t => t.trim()) : tags,
      featured: featured === "true" || featured === true,
      preferred: preferred === "true" || preferred === true,
      address,
      status
    });

    await newPost.save();

    res.status(201).json({ success: true, message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
}

const getposts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ datePosted: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve posts" });
  }
};
const updatePost = async (req, res) => {
  try {
    const { id } = req.body;
    const {
      price, pricePerSqFt, area, size, locality, tags,
      featured, preferred, address, status
    } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(id, {
      price: Number(price),
      pricePerSqFt: Number(pricePerSqFt),
      area: Number(area),
      size: Number(size),
      locality,
      tags: typeof tags === "string" ? tags.split(",").map(t => t.trim()) : tags,
      featured: featured === "true" || featured === true,
      preferred: preferred === "true" || preferred === true,
      address,
      status
    }, { new: true });

    if (!updatedPost) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ success: true, message: "Post updated", post: updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
};

module.exports = {
  postController,
    getposts,
    updatePost
};