const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    create,
    getAll,
    getOne,
    update,
    remove
} = require("../controllers/notesController");

// All notes routes require authentication
router.use(authenticateToken);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
