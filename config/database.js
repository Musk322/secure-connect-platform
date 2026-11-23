const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MongoDB URI is missing in .env file");
        }

        client = new MongoClient(uri);

        await client.connect();

        db = client.db();

        await db.command({ ping: 1 });

        console.log("MongoDB Connected Successfully!");

        return db;
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error("Database is not connected");
    }

    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB
};
