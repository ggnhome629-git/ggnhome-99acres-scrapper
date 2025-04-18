require("dotenv").config();
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];
const { Server } = require("socket.io");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`🟢 Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on("code-change", ({ privateRoomId, code }) => {
      socket.to(privateRoomId).emit("code-change", code);
    });

    socket.on("join-public-room", (publicroomID) => {
      socket.join(publicroomID);
    });

    socket.on("send-message", ({ publicroomID, ...data }) => {
      if (!publicroomID) {
        console.warn("⚠️ No public room ID provided");
        return;
      }

      socket.to(publicroomID).emit("receive-message", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;
