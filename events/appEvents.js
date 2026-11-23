const EventEmitter = require("events");

class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();

appEvents.on("user:registered", (user) => {
    console.log(`[EVENT] New user registered: ${user.email}`);
});

appEvents.on("user:loggedIn", (user) => {
    console.log(`[EVENT] User logged in: ${user.email}`);
});

appEvents.on("note:created", (note) => {
    console.log(`[EVENT] New note created: ${note.title}`);
});

module.exports = appEvents;
