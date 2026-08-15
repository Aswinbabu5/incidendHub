const bcrypt = require("bcryptjs")
const User = require("../models/User")
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existUser = await User.findOne({ email })
        if(existUser) {
            return res.status(400).json({
                message: "User Already exists"
            })
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPass, role
        })

        res.status(201).json({
            message: "User Registered successfully",
            User: { id: user._id, name: user.name, email: user.email, role: user.role }
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email })

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET_CODE,
            {
                expiresIn: "1d"
            }
        )

        res.status(200).json({
            message: "Login successfully",
            token: token,
            User: { id: user._id, name: user.name, email: user.email, role: user.role }
        })
    }
    catch(error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        })
    }
}

const getEngineer = async (req, res) => {
    try {
        const Engineer = await User.find({ role: "engineer" }).select("name email role")
        res.status(200).json({
            Engineer
        })
    }
    catch(error) {
        res.status(500).json({
            message: "Failed to get the engineer",
            error: error.message
        })
    }
}

module.exports = { registerUser, loginUser, getEngineer };