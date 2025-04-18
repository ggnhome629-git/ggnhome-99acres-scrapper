const User = require("../models/user.model");
const path = require("path");
const xlsx = require("xlsx");
const admin = require("firebase-admin");
require("dotenv").config();

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).json({ message: "Username already taken." });
    }

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(400).json({ message: "Username must be unique." });
    }
    console.error(error);
    res.status(500).json({ message: "Registration failed." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({ message: "Login successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed." });
  }
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token provided." });
    }

    // Optional: Clear the refreshToken from DB
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear cookies
    res
      .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "None" })
      .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "None" })
      .status(200)
      .json({ message: "Logout successful." });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed." });
  }
};

const getTestCasesByTitle = (req, res) => {
  const title = req.params.title;
  const filePath = path.join(__dirname, "../../client/public/TestCases.xlsx");

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const testCases = data.filter((row) => row.Title === title);

    if (testCases.length === 0) {
      return res.status(404).json({ message: "No test cases found for this question." });
    }

    res.json(testCases);
  } catch (error) {
    console.error("Error reading test cases:", error);
    res.status(500).json({ message: "Failed to read test cases." });
  }
};

const getDefaultCodeByTitle = (req, res) => {
  const title = req.params.title;
  const filePath = path.join(__dirname, "../../client/public/TestCases.xlsx");

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    const matching = data.find(
      (row) => row.Title?.toLowerCase() === title.toLowerCase() && row["Default Code (JS)"]
    );

    if (!matching) {
      console.log("Available titles:", data.map(row => row.Title));
      console.log("Requested title:", title);
      return res.status(404).json({ message: "No default code found for this question." });
    }

    res.json({ defaultCode: matching["Default Code (JS)"] });
  } catch (error) {
    console.error("Error reading default code:", error);
    res.status(500).json({ message: "Failed to read default code." });
  }
};

const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    console.log("Received idToken:", idToken);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      let uniqueName = name;
      let count = 1;
      while (await User.findOne({ name: uniqueName })) {
        uniqueName = `${name}${count}`;
        count++;
      }

      user = new User({
        name: uniqueName,
        email,
        avatar: picture,
        isGoogleUser: true,
      });
      await user.save();
    }

    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({ message: "Google login successful." });

  } catch (error) {
    console.error("Firebase Auth Error:", error.message, error.stack);
    res.status(401).json({ message: "Invalid Firebase ID token" });
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const user = await User.getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).json({ message: "Room name is required." });
    }

    // Example schema: { name: String, createdBy: ObjectId (User), participants: [] }
    const Room = require("../models/room.model");
    const newRoom = new Room({
      name: roomName,
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    await newRoom.save();
    res.status(201).json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Failed to create room." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getTestCasesByTitle,
  getDefaultCodeByTitle,
  googleAuth,
  authenticateUser,
  createRoom,
};
