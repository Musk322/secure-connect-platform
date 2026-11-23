const {
    createNote,
    getUserNotes,
    findNoteById,
    updateNote,
    deleteNote
} = require("../models/Note");

const appEvents = require("../events/appEvents");

// CREATE NOTE
async function create(req, res) {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const note = await createNote({
            title: title.trim(),
            content: content.trim(),
            ownerId: req.user.id
        });

        appEvents.emit("note:created", note);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            note
        });

    } catch (error) {
        console.error("Create Note Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// GET ALL USER NOTES
async function getAll(req, res) {
    try {
        const notes = await getUserNotes(req.user.id);

        return res.status(200).json({
            success: true,
            count: notes.length,
            notes
        });

    } catch (error) {
        console.error("Get Notes Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// GET SINGLE NOTE
async function getOne(req, res) {
    try {
        const note = await findNoteById(
            req.params.id,
            req.user.id
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
            success: true,
            note
        });

    } catch (error) {
        console.error("Get Note Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// UPDATE NOTE
async function update(req, res) {
    try {
        const { title, content } = req.body;
        const updates = {};

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title must be a non-empty string"
                });
            }

            updates.title = title.trim();
        }

        if (content !== undefined) {
            if (typeof content !== "string" || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Content must be a non-empty string"
                });
            }

            updates.content = content.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide a title or content to update"
            });
        }

        const note = await updateNote(
            req.params.id,
            req.user.id,
            updates
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            note
        });

    } catch (error) {
        console.error("Update Note Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// DELETE NOTE
async function remove(req, res) {
    try {
        const note = await deleteNote(
            req.params.id,
            req.user.id
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (error) {
        console.error("Delete Note Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove
};
