require("dotenv").config();
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];
const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const routes = require("./Route/routes");
const cookieparser = require("cookie-parser");
const setupSocket = require("./Sockets/socket");
const http = require("http");


// Initialize Express
const app = express();
const server = http.createServer(app);

app.use(cookieparser());

// Connect to Database
db();

// Middleware

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // if you're using cookies/sessions
}));
app.use(express.json());

// Routes
app.use("/", routes);

setupSocket(server);

// Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
