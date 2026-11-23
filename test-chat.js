const { io } = require("socket.io-client");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Paste your JWT token: ", (token) => {
    const socket = io("http://localhost:5000", {
        auth: { token }
    });

    socket.on("connect", () => {
        console.log("Connected to chat server!");

        socket.emit("chat:join", "general");
    });

    socket.on("chat:joined", (data) => {
        console.log("Room joined:", data.message);

        socket.emit("chat:message", {
            room: "general",
            message: "Hello! Real-time chat is working."
        });
    });

    socket.on("chat:message", (data) => {
        console.log("New chat message:", data);
        socket.disconnect();
        rl.close();
    });

    socket.on("connect_error", (error) => {
        console.log("Connection error:", error.message);
        socket.disconnect();
        rl.close();
    });
});
