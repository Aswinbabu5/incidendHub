import { useParams } from "react-router-dom"
import './IncidentDetail.css'
import { useEffect, useRef, useState } from "react"
import { assignMem, getIncidentById, UpdateIncident } from "../../API/IncidentApi"
import type { Incidents } from "../../Types/Incidents"
import Navbar from "../../components/Navbar/Navbar"
import { Download, Pencil, Trash2 } from 'lucide-react'
import type { Engineer } from "../../Types/Engineer"
import { getEngineer } from "../../API/authApi"
import type { Activity } from "../../Types/Activity"
import { getIncidentActive } from "../../API/activityApi"
import type { Attachment } from "../../Types/Attachment"
import { deleteAttachment, downloadAttachment, getAttachment, uploadAttachment } from "../../API/attachmentApi"
import type { SLAData } from "../../Types/sla"
import { getIncidentSLA } from "../../API/slaApi"
import { getErrorMessage } from "../../Utils/errorHandler"

const IncidentDetail = () => {
    const { id } = useParams()

    const [incident, setIncident] = useState<Incidents | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [edit, setEdit] = useState<boolean>(false)
    const [form, setForm] = useState({
        severity: "",
        status: "",
        rootCauseAnalysis: "",
        resolution: ""
    })
    const [assign, setAssign] = useState<boolean>(false)
    const [userId, setUserId] = useState<string>("")
    const [engineer, setEngineer] = useState<Engineer[]>([])
    const [active, setActive] = useState<Activity[]>([])
    const [attachment, setAttachment] = useState<Attachment[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [upload, setUpload] = useState<boolean>(false)
    const [sla, setSla] = useState<SLAData | null>(null)
    const [error, setError] = useState<string>("")

    const userData = localStorage.getItem("user")
    const user = userData ? JSON.parse(userData) : null
    const canAccess = user?.role === "admin" || user?.role === "engineer"

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                setLoading(true)
                setError("")

                if (!id) {
                    setError("Incident ID was not found")
                    return
                }

                const data = await getIncidentById(id)
                setIncident(data)

                setForm({
                    severity: data.severity,
                    status: data.status,
                    rootCauseAnalysis: data.rootCauseAnalysis || "",
                    resolution: data.resolution || "",
                })
            }
            catch (error) {
                setError(getErrorMessage(error, "Failed to load the Incident details"))
            }
            finally {
                setLoading(false)
            }
        }
        fetchIncident()
    }, [id])

    useEffect(() => {
        const fetchEngineer = async () => {
            try {
                const data = await getEngineer()
                setEngineer(data)
            }
            catch (error) {
                setError(getErrorMessage(error, "Failed to load the engineer"))
            }
        }

        fetchEngineer()
    }, [])

    useEffect(() => {
        const fetchActivities = async () => {
            if (!id) return
            try {
                const data = await getIncidentActive(id)
                setActive(data)
            }
            catch (error) {
                setError(getErrorMessage(error, "Failed to fetch activity"))
            }
        }

        fetchActivities()
        refresh()
        fetchAttachment()
    }, [id])

    useEffect(() => {
        const fetchSla = async () => {
            if (!id) return

            try {
                const data = await getIncidentSLA(id)
                setSla(data)
            }
            catch (error) {
                setError(getErrorMessage(error, "Failed to Calculate the SLA"))
            }
        }
        fetchSla()
    }, [id])

    const refresh = async () => {
        if (!id) return

        try {
            const data = await getIncidentActive(id)
            setActive(data)
        }
        catch (error) {
            setError(getErrorMessage("Failed to refresh"))
        }
    }

    const handleUpdate = async () => {
        if (!id) return

        try {
            await UpdateIncident(id, form)
            const Update = await getIncidentById(id)
            setIncident(Update)
            setForm({
                severity: Update.severity,
                status: Update.status,
                rootCauseAnalysis: Update.rootCauseAnalysis || "",
                resolution: Update.resolution || "",
            })
            await refresh()
            setEdit(false)
        }
        catch (error) {
            setError(getErrorMessage("Failed to Update the field"))
        }
    }

    const handleToAssign = async () => {
        if (!id || !userId.trim()) return

        try {
            setError("")
            await assignMem(id, userId)
            const assignEng = await getIncidentById(id)
            setIncident(assignEng)
            await refresh()
            setAssign(false)
            setUserId("")
        }
        catch (error) {
            setError(getErrorMessage("Failed to assign the engineer"))
        }
    }

    const handleUpload = async () => {
        if (!id || !selectedFile) return

        try {
            setUpload(true)
            await uploadAttachment(id, selectedFile)
            await fetchAttachment()
            setSelectedFile(null)
            if (fileInputRef.current)
                fileInputRef.current.value = ""
        }
        catch (error) {
            setError(getErrorMessage(error, "Failed to upload the file"))
        }
        finally {
            setUpload(false)
        }
    }

    const handleDownload = async (attach: Attachment) => {
        try {
            const blob = await downloadAttachment(attach._id)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = attach.originalName
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            setError(getErrorMessage("Download failed"))
        }
    }

    const handleDelete = async (attachId: string) => {
        const confirm = window.confirm("are sure to delete this file?")
        if (!confirm) return

        try {
            await deleteAttachment(attachId)
            await fetchAttachment()
        }
        catch (error) {
            setError(getErrorMessage("failed to delete the file"))
        }
    }

    const fetchAttachment = async () => {
        if (!id) return

        try {
            const data = await getAttachment(id)
            setAttachment(data)
        }
        catch (error) {
            setError(getErrorMessage(error, "Failed to fetch the file"))
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null)

    if (loading)
        return <p>Loading I_Details...</p>

    if (error)
        return <p className="action-error">{error}</p>

    if (!incident)
        return <p>Incident not found</p>

    return (
        <>
            <Navbar />
            <div className="incident-details-page">
                <div className="incident-details-header">
                    <div>
                        <h1>{incident.title}</h1>
                        <p className="incident-details-description">{incident.desc}</p>
                        <p className="incident-id">Incident ID: {incident._id}</p>
                    </div>

                    <div className="details-actions">
                        {
                            !assign && canAccess && (
                                <button className="details-button details-secondary-button" onClick={() => setAssign(true)}>Assign Engineer</button>
                            )
                        }
                    </div>
                </div>

                <div className="incident-details-grid">
                    <div className="incident-left-column">
                        <div className="details-card">
                            <div className="details-card-header">
                                <h2>{edit ? "Update Incident" : "Incident Information"}</h2>
                                {
                                    !edit && canAccess && (
                                        <button className="details-button details-primary-button" onClick={() => setEdit(true)}>
                                            <Pencil size={14} />
                                        </button>
                                    )
                                }
                            </div>
                            {
                                edit ? (
                                    <>
                                        <div className="inline-edit-group">
                                            <label>Severity</label>
                                            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                                                <option value="Pos1">Pos1</option>
                                                <option value="Pos2">Pos2</option>
                                                <option value="Pos3">Pos3</option>
                                                <option value="Pos4">Pos4</option>
                                            </select>
                                        </div>

                                        <div className="inline-edit-group">
                                            <label>Status</label>
                                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                                <option value="open">Open</option>
                                                <option value="investigating">Investigating</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>

                                        <div className="inline-edit-group">
                                            <label>Root Cause Analysis</label>
                                            <textarea value={form.rootCauseAnalysis} onChange={(e) => setForm({ ...form, rootCauseAnalysis: e.target.value })} />
                                        </div>

                                        <div className="inline-edit-group">
                                            <label>Resolution</label>
                                            <textarea value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} />
                                        </div>

                                        <div className="inline-edit-actions">
                                            <button className="details-button details-primary-button" onClick={handleUpdate}>Save Changes</button>
                                            <button className="details-button details-secondary-button" onClick={() => setEdit(false)}>Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="details-row">
                                            <span className="details-label">Severity</span>
                                            <span className={`details-severity details-severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span>
                                        </div>

                                        <div className="details-row">
                                            <span className="details-label">Status</span>
                                            <span className={`details-status details-status-${incident.status}`}>{incident.status}</span>
                                        </div>

                                        <div className="details-row">
                                            <span className="details-label">Assigned To</span>
                                            <span className="details-value">{incident.assignedTo ? incident.assignedTo.name : "Unassigned"}</span>
                                        </div>

                                        <div className="details-row">
                                            <span className="details-label">Created By</span>
                                            <span className="details-value">{incident.createdBy?.name || "Unknown"}</span>
                                        </div>

                                        <div className="analysis-section">
                                            <h3>Root Cause Analysis</h3>
                                            <div className="analysis-content">
                                                {incident.rootCauseAnalysis || "Root cause has not been added yet"}
                                            </div>
                                        </div>

                                        <div className="analysis-section">
                                            <h3>Resolution</h3>
                                            <div className="analysis-content">
                                                {incident.resolution || "Incident has not been resolved yet"}
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                            {
                                assign ? (
                                    <div className="assign-inline">
                                        <label>Engineer ID</label>
                                        <div className="inline-edit-group">
                                            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
                                                <option value="">Select Engineer</option>
                                                {
                                                    engineer.map((eng) => (
                                                        <option key={eng._id} value={eng._id}>{eng.name} - {eng.email}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="inline-edit-actions">
                                            <button className="details-button details-primary-button" onClick={handleToAssign}>Assign</button>
                                            <button className="details-button details-secondary-button" onClick={() => {
                                                setAssign(false)
                                                setUserId("")
                                            }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : ("")
                            }
                        </div>
                        <div className="attachment-card">

                            <div className="attachment-header">
                                <h2>Attachments</h2>
                            </div>

                            <div className="attachment-upload">
                                <input ref={fileInputRef} type="file" onChange={(e) => { const file = e.target.files?.[0] || null; setSelectedFile(file) }} />
                                {
                                    canAccess && (
                                        <button className="details-button details-primary-button" onClick={handleUpload} disabled={!selectedFile || upload}>
                                            {upload ? "Uploading..." : "Upload"}
                                        </button>
                                    )
                                }
                            </div>
                            {
                                attachment?.length === 0 ? (
                                    <p>No attachments found</p>
                                ) : (
                                    <div className="attachment-list">
                                        {
                                            attachment?.map((attach) => (
                                                <div className="attachment-item" key={attach._id}>
                                                    <div className="attachment-info">
                                                        <strong>{attach.originalName}</strong>
                                                        <span>{attach.mimeType}</span>
                                                        {
                                                            attach.fileSize && (
                                                                <span>{(attach.fileSize / 1024).toFixed(2)} KB</span>
                                                            )
                                                        }
                                                        <span>{new Date(attach.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="attachment-actions">
                                                        <button onClick={() => handleDownload(attach)}><Download size={16} /></button>
                                                        {
                                                            canAccess && (<button onClick={() => handleDelete(attach._id)}><Trash2 size={16} /></button>)
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    <div className="incident-right-column">
                        <div className="details-card">
                            <h2>SLA Information</h2>
                            <div className="sla-item">
                                <div className="sla-title">Response Deadline</div>
                                <div className="sla-value">
                                    {incident.responseDeadline ? new Date(incident.responseDeadline).toLocaleString() : "Not available"}
                                </div>
                            </div>

                            <div className="sla-item">
                                <div className="sla-title">Responded At</div>
                                <div className="sla-value">
                                    {incident.respondedAt ? new Date(incident.respondedAt).toLocaleString() : "Not responded yet"}
                                </div>
                            </div>

                            <div className="sla-item">
                                <div className="sla-title">Resolution Deadline</div>
                                <div className="sla-value">
                                    {incident.resolutionDeadline ? new Date(incident.resolutionDeadline).toLocaleString() : "Not available"}
                                </div>
                            </div>

                            <div className="sla-item">
                                <div className="sla-title">Resolved At</div>
                                <div className="sla-value">
                                    {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : "Not resolved yet"}
                                </div>
                            </div>

                            <div className="sla-item">
                                <div className="sla-title">Response SLA</div>
                                <div className={sla?.response.status === "BREACHED" ? "sla-danger" : "sla-success"}>
                                    {sla?.response.status ?? "Not available"}
                                </div>
                            </div>

                            <div className="sla-item">
                                <div className="sla-title">Resolution SLA</div>
                                <div className={sla?.resolution.status === "BREACHED" || sla?.resolution.status === "RESOLVED_LATE" ? "sla-danger" : "sla-success"}>
                                    {sla?.resolution.status ?? "Not available"}
                                </div>
                            </div>
                            <div className="activity-card">
                                <h2>Activity Timeline</h2>
                                {
                                    active.length === 0 ? (
                                        <p className="no-activity">No activity found</p>
                                    ) : (
                                        <div className="activity-timeline">
                                            {
                                                active.map((activity) => (
                                                    <div className="activity-item" key={activity._id}>
                                                        <div className="activity-marker">
                                                            <div className="activity-dot"></div>
                                                            <div className="activity-line"></div>
                                                        </div>
                                                        <div className="activity-content">
                                                            <div className="activity-top">
                                                                <h3>{activity.actions.replaceAll("_", " ")}</h3>
                                                                <span>{new Date(activity.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <p className="activity-message">{activity.msg}</p>
                                                            <p className="activity-user">By {activity.user?.name || "Unknown user"}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default IncidentDetail