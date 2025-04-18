const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room.model");
const User = require("../models/user.model");
// const { server } = require("socket.io");

// ✅ Create a new room and store it in DB
const CreateRoom = async (req, res) => {
  try {
    const roomId = uuidv4();

    const newRoom = new Room({
      roomId,
      createdBy: req.user._id,
    });

    await newRoom.save();

    // Optional: Store room reference in user's record
    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: newRoom._id },
    });

    return res.status(200).json({ roomId });
  } catch (error) {
    console.error("Failed to create room:", error);
    return res.status(500).json({ message: "Failed to create room", error });
  }
};

// ✅ Join a room using roomId
const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    console.log("🔍 Looking for room:", roomId);

    // Prevent joining the same room twice
    if (user.rooms.includes(room._id)) {
      return res.status(400).json({ message: "User already in the room." });
    }
    console.log("🔍 Room found:", room);

    user.rooms.push(room._id);
    console.log("🔍 User updated:", user);

    await user.save();

    return res.status(200).json({ message: "Room joined successfully." });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ message: "Failed to join room", error });
  }
};

// Code editor real time changes

module.exports = { CreateRoom, joinRoom };
