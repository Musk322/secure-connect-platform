require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { connectDB } = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");

const authenticateToken = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

const { getAllUsers } = require("./models/User");
const setupChat = require("./sockets/chatSocket");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Secure Connect and Communication Platform API"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected Notes routes
app.use("/api/notes", notesRoutes);

// Admin-only route
app.get(
    "/api/admin/users",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const users = await getAllUsers();

            res.status(200).json({
                success: true,
                count: users.length,
                users
            });
        } catch (error) {
            console.error("Admin Users Error:", error);

            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// Socket.IO chat setup
setupChat(io);

// Start server after database connection
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log("Secure Connect Platform is ready!");
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
