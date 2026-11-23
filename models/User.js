const { getDB } = require("../config/database");

const COLLECTION = "users";

function getUsersCollection() {
    return getDB().collection(COLLECTION);
}

async function createUser(userData) {
    const result = await getUsersCollection().insertOne({
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        role: "user",
        createdAt: new Date()
    });

    return result;
}

async function findUserByEmail(email) {
    return getUsersCollection().findOne({
        email: email.toLowerCase().trim()
    });
}

async function findUserById(id) {
    const { ObjectId } = require("mongodb");

    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getUsersCollection().findOne({
        _id: new ObjectId(id)
    });
}

async function getAllUsers() {
    return getUsersCollection()
        .find({}, {
            projection: {
                password: 0
            }
        })
        .toArray();
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers
};
