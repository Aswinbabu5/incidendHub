const Incident = require("../models/Incident");
const { param } = require("../routes/authRoutes");
const User = require("../models/User");
const Activity = require("../models/Activity");
const { sendEmail } = require("../utils/emailService")
const Attachment = require("../models/Attachment")
const fs = require("fs")

const cretIncident = async (req, res) => {
    try {
        const { title, desc, severity, assignedTo } = req.body;
        const resolutionDeadline = getResolutionDeadline(severity)
        const responseDeadline = getResponseDeadline(severity)
        const incident = await Incident.create({ title, desc, severity, assignedTo: assignedTo || null, createdBy: req.user._id, resolutionDeadline, responseDeadline })
        await Activity.create({ incident: incident._id, user: req.user._id, actions: "Incident_created", msg: `Incident "${incident.title}" was created` })

        res.status(201).json({
            message: "Incident created successfully",
            incident
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create incident",
            error: error.message
        })
    }
}

const getIncident = async (req, res) => {
    try {
        const { status, severity, search, sort = "newest", page = 1, limit = 10 } = req.query
        const filter = {}
        if (status)
            filter.status = status
        if (severity)
            filter.severity = severity
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search, $options: "i"
                    }
                },
                {
                    desc: {
                        $regex: search, $options: "i"
                    }
                }
            ]
        }

        let sortOption = { createdAt: -1 }

        if (sort === "oldest") 
            sortOption = { createdAt: 1 }
        
        if (sort === "severity") 
            sortOption = { severity: 1 } 
        
        if (sort === "status") 
            sortOption = { status: 1 }
        
        const pageNo = Number(page)
        const lmtNo = Number(limit)

        const incident = await Incident.find(filter)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .sort(sortOption)
            .skip((pageNo - 1) * lmtNo)
            .limit(lmtNo)

        const total = await Incident.countDocuments(filter)

        res.status(200).json({
            total,
            page: pageNo,
            limit: lmtNo,
            totalPages: Math.ceil(total / lmtNo),
            incident
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch the information",
            error: error.message
        })
    }
}

const getMyIncident = async (req, res) => {
    try {
        const incident = await Incident.find({ assignedTo: req.user._id })
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 })

        res.status(200).json({
            count: incident.length,
            incident
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch the incident information",
            error: error.message
        })
    }
}

const getIncidentId = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("assignedTo", "name email role")

        if (!incident) {
            return res.status(404).json({
                message: "Incident was not found"
            })
        }

        res.status(200).json({
            incident
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch the ID",
            error: error.message
        })
    }
}

const UpdateIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            })
        }

        const oldstatus = incident.status
        const oldseverity = incident.severity
        const oldrootCauseAnalysis = incident.rootCauseAnalysis
        const oldresoln = incident.resolution

        const { title, desc, severity, status, assignedTo, rootCauseAnalysis, resolution } = req.body

        if (title != undefined)
            incident.title = title
        if (desc != undefined)
            incident.desc = desc
        if (severity != undefined)
            incident.severity = severity
        if (status != undefined) {
            incident.status = status
            if (status === "resolved" && !incident.resolvedAt)
                incident.resolvedAt = new Date()
        }
        if (assignedTo != undefined)
            incident.assignedTo = assignedTo
        if (rootCauseAnalysis != undefined)
            incident.rootCauseAnalysis = rootCauseAnalysis
        if (resolution != undefined)
            incident.resolution = resolution

        const isOverdue = incident.status !== "resolved" && incident.status !== "closed" && incident.resolutionDeadline && new Date() > incident.resolutionDeadline;

        const updatedIncident = await incident.save()

        if (oldstatus !== updatedIncident.status) {
            await Activity.create({ incident: updatedIncident._id, user: req.user._id, actions: "Status_Changed", msg: `Status was changed from ${oldstatus} to ${updatedIncident.status}` })
        }
        if (oldseverity !== updatedIncident.severity) {
            await Activity.create({ incident: updatedIncident._id, user: req.user._id, actions: "Severity_Changed", msg: `Severity was changed from ${oldseverity} to ${updatedIncident.severity}` })
        }
        if (oldrootCauseAnalysis !== updatedIncident.rootCauseAnalysis) {
            await Activity.create({ incident: updatedIncident._id, user: req.user._id, actions: "Root_Cause_Updated", msg: "Root issue was updated" })
        }
        if (oldresoln !== updatedIncident.resolution) {
            await Activity.create({ incident: updatedIncident._id, user: req.user._id, actions: "Resolution_Updated", msg: "Resolution was updated" })
        }

        res.status(200).json({
            message: "Incident updated successfully",
            incident: updatedIncident,
            isOverdue
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update Incident",
            error: error.message
        })
    }
}

const assignMem = async (req, res) => {
    try {
        const { userId } = req.body
        const incident = await Incident.findById(req.params.id)

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (user.role !== "engineer") {
            return res.status(400).json({
                message: "Only engineer users can be assigned"
            })
        }

        if (incident.assignedTo && incident.assignedTo.toString() === user._id.toString()) {
            return res.status(400).json({
                message: "Engineer was already assigned"
            })
        }

        incident.assignedTo = user._id

        if (!incident.respondedAt)
            incident.respondedAt = new Date()

        await incident.save()

        try {
            await sendEmail(user.email, "Incident Assigned", `You have been assigned to incident: ${incident.title}`)
            console.log("Email send successfully")
        }
        catch (error) {
            console.error("email error: ", error.message);
        }

        await Activity.create({ incident: incident._id, user: req.user._id, actions: "Engineer_Assigned", msg: `Incident was assigned to ${user.name}` })

        const updatedAssigned = await Incident.findById(incident._id)
            .populate("assignedTo", "name email role")
            .populate("createdBy", "name email role")

        res.status(200).json({
            message: "Engineer assigned successfully",
            incident: updatedAssigned
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to assign engineer",
            error: error.message
        })
    }
}

const getIncidentActive = async (req, res) => {
    try {
        const activites = await Activity.find({ incident: req.params.id })
            .populate("user", "name email role")
            .sort({ createdAt: 1 })

        res.status(200).json({
            count: activites.length,
            activites
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch incident info",
            error: error.message
        })
    }
}

const getIncidentStats = async (req, res) => {
    try {
        const total = await Incident.countDocuments()
        const open = await Incident.countDocuments({ status: "open" })
        const investigate = await Incident.countDocuments({ status: "investigating" })
        const resolved = await Incident.countDocuments({ status: "resolved" })
        const closed = await Incident.countDocuments({ status: "closed" })
        const critical = await Incident.countDocuments({ severity: "Pos1" })
        res.status(200).json({
            total,
            open,
            investigate,
            resolved,
            closed,
            critical
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch the incidenxt statistics",
            error: error.message
        })
    }
}

const getResolutionDeadline = (severity) => {
    const now = new Date()

    const hours = {
        Pos1: 2,
        Pos2: 6,
        Pos3: 24,
        Pos4: 48
    }

    const deadline = new Date(now);
    deadline.setHours(deadline.getHours() + hours[severity])
    return deadline;
}

const getResponseDeadline = (severity) => {
    const now = new Date()

    const min = {
        Pos1: 2,
        Pos2: 6,
        Pos3: 24,
        Pos4: 48
    }

    const deadline = new Date(now);
    now.getTime() + min[severity] * 60 * 1000
    return deadline;
}

const getIncidentSLA = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            })
        }

        let responseSLA;

        if (incident.respondedAt)
            responseSLA = incident.respondedAt <= incident.responseDeadline ? "WITHIN_SLA" : "BREACHED"
        else
            responseSLA = new Date() <= incident.responseDeadline ? "WITHIN_SLA" : "BREACHED"


        let resolutionSLA;

        if (incident.resolvedAt)
            resolutionSLA = incident.resolvedAt <= incident.resolutionDeadline ? "RESOLVED_WITHIN_SLA" : "RESOLVED_LATE"

        else
            resolutionSLA = new Date() <= incident.resolutionDeadline ? "WITHIN_SLA" : "BREACHED"

        res.status(200).json({
            incidentId: incident._id,
            severity: incident.severity,

            response: {
                deadline: incident.responseDeadline,
                respondedAt: incident.respondedAt,
                status: responseSLA
            },

            resolution: {
                deadline: incident.resolutionDeadline,
                resolvedAt: incident.resolvedAt,
                status: resolutionSLA
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch SLA status",
            error: error.message
        })
    }
}

const getSeverityAnalytics = async (req, res) => {
    try {
        const severityData = await Incident.aggregate(
            [
                {
                    $group: {
                        _id: "$severity",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]
        )

        res.status(200).json({
            severityData
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch severity analytics",
            error: error.message
        });
    }
}

const getResolutionAnalytics = async (req, res) => {
    try {
        const data = await Incident.aggregate(
            [
                {
                    $match: {
                        resolvedAt: { $ne: null }
                    }
                },
                {
                    $project: {
                        resolutionTimeMs: {
                            $subtract: ["$resolvedAt", "$createdAt"]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageResolutionTimeMs: {
                            $avg: "$resolutionTimeMs"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        averageResolutionTimeMs: 1,
                        averageResolutionTimeMinutes: {
                            $divide: ["$averageResolutionTimeMs", 1000 * 60]
                        }
                    }
                }
            ]
        )

        res.status(200).json({
            analytics: data[0] || {
                averageResolutionTimeMs: 0,
                averageResolutionTimeMinutes: 0
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resolution analytics",
            error: error.message
        })
    }
}

const getEngineerWorkload = async (req, res) => {
    try {
        const data = await Incident.aggregate(
            [
                {
                    $match: {
                        assignedTo: { $ne: null },
                        status: { $in: ["open", "investigating"] }
                    }
                },
                {
                    $group: {
                        _id: "$assignedTo",
                        activeIncidents: {
                            $sum: 1
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "engineer"
                    }
                },
                {
                    $unwind: "$engineer"
                },
                {
                    $project: {
                        _id: 0,
                        engineerId: "$engineer._id",
                        name: "$engineer.name",
                        email: "$engineer.email",
                        activeIncidents: 1
                    }
                },
                {
                    $sort: {
                        activeIncidents: -1
                    }
                }
            ]
        )

        res.status(200).json({
            workload: data
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch engineer workload",
            error: error.message
        })
    }
}

const getSlaAnalytics = async (req, res) => {
    try {
        const incidents = await Incident.find({
            responseDeadline: { $ne: null },
            resolutionDeadline: { $ne: null }
        })

        let responseWithinSla = 0;
        let responseBreached = 0;
        let resolutionWithinSla = 0;
        let resolutionBreached = 0;

        incidents.forEach((incident) => {

            if (incident.respondedAt) {
                if (incident.respondedAt <= incident.responseDeadline)
                    responseWithinSla++;
                else
                    responseBreached++;

            }
            else {
                if (new Date() <= incident.responseDeadline)
                    responseWithinSla++;
                else
                    responseBreached++;

            }

            if (incident.resolvedAt) {
                if (incident.resolvedAt <= incident.resolutionDeadline)
                    resolutionWithinSla++;
                else
                    resolutionBreached++;

            }
            else {
                if (new Date() <= incident.resolutionDeadline)
                    resolutionWithinSla++;
                else
                    resolutionBreached++;

            }
        })

        res.status(200).json({
            responseSla: {
                withinSla: responseWithinSla,
                breached: responseBreached
            },

            resolutionSla: {
                withinSla: resolutionWithinSla,
                breached: resolutionBreached
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch SLA analytics",
            error: error.message
        })
    }
}

const getIncidentsPerDay = async (req, res) => {
    try {
        const data = await Incident.aggregate(
            [
                {
                    $match: {
                        createdAt: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        count: 1
                    }
                }
            ]
        )

        res.status(200).json({
            incidentsPerDay: data
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch incidents per day",
            error: error.message
        })
    }
}

const uploadAttachment = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a file"
            })
        }

        const attachment = await Attachment.create({
            incident: incident._id,
            uploadedBy: req.user._id,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            filePath: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size
        })

        res.status(201).json({
            message: "File uploaded successfully",
            attachment
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to upload file",
            error: error.message
        })
    }
}

const getAttachment = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            })
        }

        const attachment = await Attachment.find({
            incident: incident._id
        })
            .populate("uploadedBy", "name email role")
            .sort({ createdAt: -1 })

        res.status(200).json({
            count: attachment.length,
            attachment
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch attachments",
            error: error.message
        })
    }
}

const downloadAttachment = async (req, res) => {
    try {
        const attachment = await Attachment.findById(req.params.attachmentId)

        if (!attachment) {
            return res.status(404).json({
                message: "Attachment not found"
            })
        }

        res.download(attachment.filePath, attachment.originalName)

    } catch (error) {
        res.status(500).json({
            message: "Failed to download attachment",
            error: error.message
        })
    }
}

const deleteAttachment = async (req, res) => {
    try {
        const attachment = await Attachment.findById(req.params.attachmentId)

        if (!attachment) {
            return res.status(404).json({
                message: "Attachment not found"
            })
        }

        if (fs.existsSync(attachment.filePath))
            fs.unlinkSync(attachment.filePath)

        await Attachment.findByIdAndDelete(attachment._id)

        res.status(200).json({
            message: "Attachment deleted successfully"
        })

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete attachment",
            error: error.message
        })
    }
}

module.exports = { cretIncident, getIncident, getMyIncident, getIncidentId, UpdateIncident, assignMem, getIncidentActive, getIncidentStats, getIncidentSLA, getSeverityAnalytics, getResolutionAnalytics, getEngineerWorkload, getSlaAnalytics, getIncidentsPerDay, uploadAttachment, getAttachment, downloadAttachment, deleteAttachment }