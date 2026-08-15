const mongoose = require("mongoose")

const ActiveSche = new mongoose.Schema(
    {
        incident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        actions: {
            type: String,
            required: true
        },
        msg: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Activity = mongoose.model("Activity", ActiveSche)

module.exports = Activity