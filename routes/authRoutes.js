const express = require("express");
const router = express.Router();

const {
    signup,
    login
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", authenticateToken, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Authenticated user details",
        user: req.user
    });
});

module.exports = router;
