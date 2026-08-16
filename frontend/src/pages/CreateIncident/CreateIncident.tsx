import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import { useNavigate } from 'react-router-dom'
import { cretIncident } from '../../API/IncidentApi'
import './CreateIncident.css'
import { getErrorMessage } from '../../Utils/errorHandler'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'
import Loading from '../../components/Loading/Loading'

const CreateIncident = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        title: "",
        desc: "",
        severity: "Pos3"
    })
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError("")

            const data = await cretIncident(form)
            navigate(`/incident/${data.incident._id}`)
        }
        catch (error) {
            setError(getErrorMessage(error, "Failed to create the incident"))
        }
        finally {
            setLoading(false)
        }
    }

    if(loading) {
        <>
            <Navbar />
            <Loading text='Loading...' />
        </>
    }
        
    if(error) {
        <>
            <Navbar />
            <ErrorMessage message={error} />
        </>
    }
        
    return (
        <>
            <Navbar />
            <div className="create-incident-page">
                <div className="create-layout">
                    <section className="create-info-panel">
                        <p className="create-eyebrow">Incident Management</p>
                        <h1>Create a new Incident</h1>
                        <p className="create-description">Record an operational issue so it can be tracked, assigned, investigated and resolved.</p>

                        <div className="create-guide">
                            <div className="guide-item">
                                <span className="guide-number">01</span>
                                <div>
                                    <h3>Describe the issue</h3>
                                    <p>
                                        Add a clear title and enough detail for the
                                        engineering team to understand the problem.
                                    </p>
                                </div>
                            </div>

                            <div className="guide-item">
                                <span className="guide-number">02</span>
                                <div>
                                    <h3>Choose severity</h3>
                                    <p>
                                        Select the impact level based on how critical
                                        the incident is.
                                    </p>
                                </div>
                            </div>

                            <div className="guide-item">
                                <span className="guide-number">03</span>
                                <div>
                                    <h3>Start tracking</h3>
                                    <p>
                                        After creation, the incident can be assigned,
                                        updated and monitored through its timeline.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="severity-guide">
                            <p>Severity Reference</p>

                            <div className="severity-guide-row">
                                <span className="severity-pill pos1">Pos1</span>
                                <span>Critical</span>
                            </div>

                            <div className="severity-guide-row">
                                <span className="severity-pill pos2">Pos2</span>
                                <span>High</span>
                            </div>

                            <div className="severity-guide-row">
                                <span className="severity-pill pos3">Pos3</span>
                                <span>Medium</span>
                            </div>

                            <div className="severity-guide-row">
                                <span className="severity-pill pos4">Pos4</span>
                                <span>Low</span>
                            </div>
                        </div>
                    </section>

                    <section className="create-form-panel">
                        <div className="create-form-header">
                            <div>
                                <p className="create-form-label">New Incident</p>
                                <h2>Incident Details</h2>
                                <p>Provide the initial information for this incident.</p>
                            </div>
                        </div>

                        <div className="create-form">
                            <div className="create-field">
                                <label>Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                                <span>Use a short and clear summary of the issue.</span>
                            </div>

                            <div className="create-field">
                                <label>Description</label>
                                <input type="text" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} required />

                                <span>
                                    Add enough information for another engineer to
                                    understand the incident.
                                </span>
                            </div>

                            <div className="create-field">
                                <label>Severity</label>
                                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                                    <option value="Pos1">Pos1 - Critical</option>
                                    <option value="Pos2">Pos2 - High</option>
                                    <option value="Pos3">Pos3 - Medium</option>
                                    <option value="Pos4">Pos4 - Low</option>
                                </select>
                            </div>
                            {
                                error && (<p className='create-error'>{error}</p>)
                            }
                            <div className="create-actions">
                                <button className="create-cancel-button" onClick={() => navigate("/incident")}>cancel</button>
                                <button className="create-submit-button" onClick={handleSubmit} disabled={loading}>{loading ? "Creating Incident..." : "Create Incident"}</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}

export default CreateIncident
