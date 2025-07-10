const express = require("express");
const router = express.Router(); // Use 'router', not 'routes'
const User = require("../controllers/UserController");
const Post = require("../controllers/PostController");
const { upload } = require("../middleware/multer");
const { registerUser , markPreferredPlot, getUser } = require("../controllers/UserController")
const {postController, getposts, updatePost} = require("../controllers/PostController")


router.post("/form" , registerUser)
router.post("/post", upload.fields([{ name: "posts", maxCount: 5 }]), postController)

router.get("/getposts", getposts)
router.post("/mark-preferred-plot", markPreferredPlot);
router.get("/get-user/:id", getUser);
router.post("/update-post", upload.fields([{ name: "posts", maxCount: 5 }]), updatePost);

router.delete("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await require("../models/post.model").findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
});





module.exports = router;