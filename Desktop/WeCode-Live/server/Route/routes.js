const express = require("express");
const router = express.Router(); // Use 'router', not 'routes'
const {
  registerUser,
  loginUser,
  logoutUser,
  getTestCasesByTitle,
  getDefaultCodeByTitle,
  googleAuth,
} = require("../controllers/Route.controller");
const {
  updateQuestion,
  fetchquestion,
} = require("../controllers/Question.controller"); // Import updateQuestion
const {
  updateuserprofile,
  fetchuserprofile,
} = require("../controllers/profile.controller");

const { CreateRoom , joinRoom } = require("../controllers/Room.controller");

const { verifyToken } = require("../middleware/auth");
const { FollowUser ,CheckFollowing, FollowDashboard,SearchUser, UnfollowUser } = require("../controllers/Follow.controller");
const multer = require("multer");
const { postcontroller , Feedcontroller } = require("../controllers/post.controller");

const upload = require("../middleware/multer");


// Define Routes
router.get("/", (req, res) => {
  res.send("Hello World this is backend");
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/questions_update", verifyToken, updateQuestion);
router.get("/fetch_dashboard", verifyToken, fetchquestion);
router.get("/userprofile", verifyToken, fetchuserprofile);
router.post("/user_update_profile", upload.single("profileImage"), verifyToken, updateuserprofile);
router.get("/create_room", verifyToken, CreateRoom);
router.post("/join_room", verifyToken, joinRoom);
router.post("/follow", verifyToken, FollowUser);
router.post("/unfollow", verifyToken, UnfollowUser);
router.post("/check-following", verifyToken, CheckFollowing);
router.get("/follow-dashboard", verifyToken, FollowDashboard);
router.post("/upload-post", upload.fields([{ name: 'posts', maxCount: 10 }]), verifyToken, postcontroller);
router.get("/Feed", verifyToken, Feedcontroller);
router.get("/SearchUser", verifyToken, SearchUser);

router.get("/testcases/:title", getTestCasesByTitle);
router.get("/testcases/default/:title", getDefaultCodeByTitle);

router.post("/logout", verifyToken, logoutUser);
router.post("/auth/google", googleAuth);

module.exports = router; // Export router
