const express = require("express");
const { registerUser, loginUser, getEngineer } = require("../controller/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Protected Login Route",
        user: req.user
    })
})
router.get("/engineer", protect, getEngineer)

module.exports = router;