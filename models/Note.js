const { ObjectId } = require("mongodb");
const { getDB } = require("../config/database");

function getNotesCollection() {
    return getDB().collection("notes");
}

async function createNote(noteData) {
    const note = {
        title: noteData.title,
        content: noteData.content,
        ownerId: noteData.ownerId,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await getNotesCollection().insertOne(note);

    return {
        _id: result.insertedId,
        ...note
    };
}

async function getUserNotes(ownerId) {
    return getNotesCollection()
        .find({ ownerId })
        .sort({ createdAt: -1 })
        .toArray();
}

async function findNoteById(id, ownerId) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getNotesCollection().findOne({
        _id: new ObjectId(id),
        ownerId
    });
}

async function updateNote(id, ownerId, updates) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    const result = await getNotesCollection().findOneAndUpdate(
        {
            _id: new ObjectId(id),
            ownerId
        },
        {
            $set: {
                ...updates,
                updatedAt: new Date()
            }
        },
        { returnDocument: "after" }
    );

    return result;
}

async function deleteNote(id, ownerId) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getNotesCollection().findOneAndDelete({
        _id: new ObjectId(id),
        ownerId
    });
}

module.exports = {
    createNote,
    getUserNotes,
    findNoteById,
    updateNote,
    deleteNote
};
