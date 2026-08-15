const mongoose = require("mongoose");

const IncidentSche = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        desc: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ["Pos1", "Pos2", "Pos3", "Pos4"],
            default: "Pos3"
        },
        status: {
            type: String,
            enum: ["open", "investigating", "resolved", "closed"],
            default: "open"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        rootCauseAnalysis: {
            type: String,
            default: ""
        },
        resolution: {
            type: String,
            default: ""
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        responseDeadline: {
            type: Date,
            default: null
        },

        resolutionDeadline: {
            type: Date,
            default: null
        },

        resolvedAt: {
            type: Date,
            default: null
        },
        respondedAt: {
            type: Date,
            default: null
        },
    },
    {
        timestamps: true
    }
)

const Incident = mongoose.model("Incident", IncidentSche)

module.exports = Incident;