const mongoose = require("mongoose");

const userSche = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlenght: 6
        },
        role: {
            type: String,
            enum: ["admin", "engineer", "viewer"],
            default: "viewer"
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSche);

module.exports = User;