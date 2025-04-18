import React from "react";
import axios from "axios";



// 🔧 Function to create a room and navigate to it
export const createroom = async () => {
  try {
    const response = await axios.get(
      process.env.REACT_APP_ROOM_CREATE,
      {
        withCredentials: true,
      }
    );

    const roomId = response.data.roomId;
    console.log("✅ Room Created:", roomId);
    return roomId;
  } catch (error) {
    console.error("❌ Room creation failed:", error);
    throw error;
  }
};

// 🔧 Function to join a room and navigate to it
export const joinroom = async (roomId) => {
  try {
    await axios.post(
      process.env.REACT_APP_ROOM_JOIN,
      { roomId },
      {
        withCredentials: true,
      }
    );

    console.log("✅ Joined Room in rooms file:", roomId);
    return roomId;
  } catch (error) {
    console.error("❌ Room join failed:", error);
    throw error;
  }
};

// 👇 Optional fallback UI component
const Room = () => {
  return <div>Creating Room...</div>;
};

export default Room;