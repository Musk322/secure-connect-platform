const jwt = require("jsonwebtoken");

function setupChat(io) {

    // Authenticate Socket.IO connections using JWT
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.user = {
                id: decoded.sub,
                role: decoded.role
            };

            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {

        console.log(`Chat user connected: ${socket.user.id}`);

        socket.on("chat:join", (roomName) => {
            if (
                typeof roomName !== "string" ||
                !/^[a-zA-Z0-9_-]{1,50}$/.test(roomName)
            ) {
                return socket.emit("chat:error", {
                    message: "Invalid room name"
                });
            }

            socket.join(roomName);

            socket.emit("chat:joined", {
                room: roomName,
                message: "Successfully joined chat room"
            });
        });

        socket.on("chat:message", (data) => {
            if (
                !data ||
                typeof data.room !== "string" ||
                typeof data.message !== "string" ||
                !/^[a-zA-Z0-9_-]{1,50}$/.test(data.room) ||
                !data.message.trim() ||
                data.message.length > 1000
            ) {
                return socket.emit("chat:error", {
                    message: "Invalid chat message"
                });
            }

            if (!socket.rooms.has(data.room)) {
                return socket.emit("chat:error", {
                    message: "Join the room before sending messages"
                });
            }

            const chatMessage = {
                sender: socket.user.id,
                message: data.message.trim(),
                room: data.room,
                timestamp: new Date()
            };

            io.to(data.room).emit("chat:message", chatMessage);
        });

        socket.on("disconnect", () => {
            console.log(`Chat user disconnected: ${socket.user.id}`);
        });
    });
}

module.exports = setupChat;
