import { useEffect, useState } from 'react'
import type { Incidents } from '../../Types/Incidents'
import getIncident, { getMyIncident } from '../../API/IncidentApi'
import './Incident.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import { getSlaStatus } from '../../Utils/sla'
import { getErrorMessage } from '../../Utils/errorHandler'

const Incident = () => {
    const [incident, setIncident] = useState<Incidents[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [fetch, setFetch] = useState<boolean>(true)
    const [search, setSearch] = useState<string>("")
    const [debouncedSearch, setDebouncedSearch] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [severity, setSeverity] = useState<string>("")
    const [page, setPage] = useState<number>(1)
    const [totpage, setTotPage] = useState<number>(1)
    const [total, setTotal] = useState<number>(0)
    const [viewMode, setViewMode] = useState<"all" | "mine">("all")
    const [now, setNow] = useState(new Date())
    const limit = 5
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [sort, setSort] = useState<string>("newest")
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const severityFromUri = searchParams.get("severity")

        if(severityFromUri) {
            setSeverity(severityFromUri)
            setPage(1)
        }
    }, [searchParams])

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date())
        }, 60000)

        return () => clearInterval(timer)
    } ,[])

    useEffect(() => {
        const fetchIncident = async () => {
            try {
                setFetch(true)
                setError("")
                let data

                if (viewMode === 'mine')
                    data = await getMyIncident()
                else
                    data = await getIncident({ search: debouncedSearch, status, severity, sort, page, limit })

                if (viewMode === 'mine') {
                    setIncident(data)
                    setPage(1)
                    setTotal(data.length)
                }
                else {
                    setIncident(data.incident)
                    setTotPage(data.totalPages)
                    setTotal(data.total)
                }
            }
            catch (error) {
                setError(getErrorMessage(error, "Failed to load incident"))
            }
            finally {
                setLoading(false)
                setFetch(false)
            }
        }

        fetchIncident()
    }, [debouncedSearch, status, severity, sort, page, viewMode])

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 500)

        return () => {
            clearTimeout(timer)
        }
    }, [search])

    if (loading)
        return <p>Loading Incident...</p>

    if (error)
        return <p>{error}</p>

    return (
        <>
            <Navbar />
            <div className='incident-page'>
                <section className="incident-hero">
                    <div className='incident-page-header'>
                        <div>
                            <p className="incident-eyebrow">Incident Management</p>
                            <h1>Incidents</h1>
                            <p>Monitor, filter and manage production incidents</p>
                        </div>
                    </div>

                    <div className="incident-summary-row">
                        <div className="incident-mini-card">
                            <span>Total</span>
                            <strong>{total}</strong>
                        </div>

                        <div className="incident-mini-card">
                            <span>Current page</span>
                            <strong>{page}</strong>
                        </div>

                        <div className="incident-mini-card">
                            <span>Result</span>
                            <strong>{incident.length}</strong>
                        </div>
                    </div>
                </section>

                <div className='incident-workspace'>
                    <div className="incident-view-switch">
                        <button className={viewMode === "all" ? "active" : ""} onClick={() => {setViewMode("all"); setPage(1)}}>
                            All Incidents
                        </button>
                        <button className={viewMode === "mine" ? "active" : ""} onClick={() => {setViewMode("mine"); setPage(1)}}>
                            My Incidents
                        </button>
                    </div>
                    <div className="incident-toolbar">
                        <input type="text" placeholder='search incident' value={search} onChange={(e) => setSearch(e.target.value)} />

                        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="investigating">Investigate</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select value={severity} onChange={(e) => { 
                            const val = e.target.value
                            setSeverity(val) 
                            setPage(1) 

                            if(val)
                                setSearchParams({ severity: val })

                            else
                                setSearchParams({})
                        }}>
                            <option value="">All Severity</option>
                            <option value="Pos1">Pos1</option>
                            <option value="Pos2">Pos2</option>
                            <option value="Pos3">Pos3</option>
                            <option value="Pos4">Pos4</option>
                        </select>

                        <select value={sort} onChange={(e) => {setSort(e.target.value); setPage(1)}}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="severity">Severity</option>
                            <option value="status">Status</option>
                        </select>
                    </div>
                </div>

                {
                    (search || status || severity) && (
                        <button className="clear-filter-button" onClick={() => {
                            setSearch("")
                            setStatus("")
                            setSeverity("")
                            setPage(1)
                        }}>clear</button>
                    )
                }
                {
                    !loading && incident.length === 0 && (
                        <div className="incident-empty-state">
                            <div className="empty-icon">!</div>
                            <h3>No incidents found</h3>
                            <p>No incidents match your current search or filters.</p>
                            <button onClick={() => {
                                setSearch("")
                                setStatus("")
                                setSeverity("")
                                setPage(1)
                                setViewMode("all")
                                setSearchParams({})
                            }}
                            >Clear Filters</button>
                        </div>
                    )
                }
                {
                    incident.length > 0 && (
                        <div className={`incident-table-container ${fetch ? "table-fetching" : ""}`}>
                            {
                                incident.length === 0 ? (<p className='no-incidents'>No incidents found it</p>) :
                                    (
                                        <table className='incident-table'>
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Severity</th>
                                                    <th>Status</th>
                                                    <th>Assigned To</th>
                                                    <th>SLA</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    incident.map((list) => (
                                                        <tr key={list._id} className='incident-row' onClick={() => navigate(`/incident/${list._id}`)}>
                                                            <td className='incident-title'>{list.title}</td>
                                                            <td>
                                                                <span className={`severity severity-${list.severity.toLowerCase()}`}>{list.severity}</span>
                                                            </td>
                                                            <td>
                                                                <span className={`status status-${list.status}`}>{list.status}</span>
                                                            </td>
                                                            <td>
                                                                {
                                                                    list.assignedTo ? list.assignedTo.name : "Unassigned"
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    getSlaStatus(list, now) === "resolution-breached" && (
                                                                        <span className="sla-badge sla-breached">Resolution Breached</span>
                                                                    )
                                                                }

                                                                {
                                                                    getSlaStatus(list, now) === "response-breached" && (
                                                                        <span className="sla-badge sla-warning">Response Breached</span>
                                                                    )
                                                                }

                                                                {
                                                                    getSlaStatus(list, now) === "within-sla" && (
                                                                        <span className="sla-badge sla-ok">Within SLA</span>
                                                                    )
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    )
                            }
                        </div>
                    )
                }
                <div className="incident-pagination-footer">
                    <span>Showing {incident.length} of {total} incidents</span>
                    <div className='pagination'>
                        <button onClick={() => setPage((prev) => prev - 1)} disabled={page <= 1}>Previous</button>
                        <span>page {page} to {totpage}</span>
                        <button onClick={() => setPage((prev) => prev + 1)} disabled={page >= totpage}>Next</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Incident
