import { useEffect, useState } from 'react'
import type { IncidentStats } from '../../Types/analytics'
import getIncidentStats from '../../API/IncidentStatsApi'
import './Dashboard.css'
import Navbar from '../../components/Navbar/Navbar'
import { useNavigate } from 'react-router-dom'
import getIncident from '../../API/IncidentApi'
import { getSlaStatus } from '../../Utils/sla'
import type { Incidents } from '../../Types/Incidents'
import { getErrorMessage } from '../../Utils/errorHandler'
import Loading from '../../components/Loading/Loading'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'

const Dashboard = () => {
  const [stats, setStats] = useState<IncidentStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [slaStats, setSlaStats] = useState({
    within: 0,
    responseBreached: 0,
    resolutionBreached: 0
  })
  const [recentIncidents, setRecentIncidents] = useState<Incidents[]>([])
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  const userData = localStorage.getItem("user")
  const user = userData ? JSON.parse(userData) : null

  const canAccess = user?.role === "admin" || user?.role === "engineer"

  useEffect(() => {
    const fetchStat = async () => {
      try {
        const data = await getIncidentStats()
        setStats(data)

        const incidentData = await getIncident({ page: 1, limit: 100 })
        const date = new Date()
        let within = 0
        let responseBreached = 0
        let resolutionBreached = 0

        incidentData.incident.forEach((list) => {
          const sla = getSlaStatus(list, date)

          if (sla === "within-sla")
            within++

          if (sla === "response-breached")
            responseBreached++

          if (sla === "resolution-breached")
            resolutionBreached++
        })
        setSlaStats({ within, responseBreached, resolutionBreached })

        const incidData = await getIncident({
          page: 1,
          limit: 5,
          sort: "newest"
        })

        setRecentIncidents(incidData.incident)
      }
      catch (error) {
        setError(getErrorMessage(error, "Failed to load the dashboard statistics"))
      }
      finally {
        setLoading(false)
      }
    }

    fetchStat()
  }, [])

  if (loading) {
    <>
      <Navbar />
      <Loading text='Loading Dashboard...' />
    </>
  }
    

  if (error) {
    <>
      <Navbar />
      <ErrorMessage message={error} />
    </>
  }
    
  return (
    <>
      <Navbar />
      <div className="dashboard">
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-label">incident overview</p>
            <h1>operation dashboard</h1>
            <p className="dashboard-subtitle">monitor active incidents and system health</p>
          </div>

          <div className="dashboard-hero-actions">
            <button className="dashboard-secondary-btn" onClick={() => navigate("/incident")}>View Incident</button>
            {
              canAccess && (<button className="dashboard-primary-btn" onClick={() => navigate("/incident/create")}>Create Incident</button>)
            }
          </div>
        </section>

        <section className="dashboard-summary">
          <div className="summary-card total-card">
            <div className="summary-header">
              <span>Total Incidents</span>
              <span className="summary-dot total-dot"></span>
            </div>
            <h2>{stats?.total ?? 0}</h2>
            <p>All recorded Incidents</p>
          </div>

          <div className="summary-card total-card">
            <div className="summary-header">
              <span>Open</span>
              <span className="summary-dot total-dot"></span>
            </div>
            <h2>{stats?.open ?? 0}</h2>
            <p>Waiting for Investigation</p>
          </div>

          <div className="summary-card total-card">
            <div className="summary-header">
              <span>Investigating</span>
              <span className="summary-dot total-dot"></span>
            </div>
            <h2>{stats?.investigate ?? 0}</h2>
            <p>Currently being handled</p>
          </div>

          <div className="summary-card total-card">
            <div className="summary-header">
              <span>Critical</span>
              <span className="summary-dot total-dot"></span>
            </div>
            <h2>{stats?.critical ?? 0}</h2>
            <p>All recorded Incidents</p>
          </div>
        </section>

        <section className="dashboard-bottom">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">Incident Status</p>
                <h3>Resolution Overview</h3>
              </div>
            </div>

            <div className="resolution-grid">
              <div className="resolution-item">
                <span>Resolved</span>
                <strong>{stats?.resolved ?? 0}</strong>
              </div>

              <div className="resolution-item">
                <span>Closed</span>
                <strong>{stats?.closed ?? 0}</strong>
              </div>

              <div className="resolution-item">
                <span>Active</span>
                <strong>{(stats?.open ?? 0) + (stats?.investigate ?? 0)}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-panel health-panel">
            <p className="panel-label">Attention Required</p>
            <div className="health-number">{stats?.critical ?? 0}</div>
            <h3>Critical Incident</h3>
            <p>High-priority incidents that may require immediate investigation.</p>
            <button className='critical-review-btn' onClick={() => navigate("/incident?severity=Pos1")}>Review Critical Incident</button>
          </div>
        </section>

        <section className="dashboard-panel sla-overview">
          <div>
            <p className="panel-label">SLA Monitoring</p>
            <h3>SLA Health</h3>
          </div>

          <div className="sla-dashboard-grid">
            <div className="sla-dashboard-item sla-dashboard-ok">
              <span>Within SLA</span>
              <strong>{slaStats.within}</strong>
            </div>

            <div className="sla-dashboard-item sla-dashboard-warning">
              <span>Response Breached</span>
              <strong>{slaStats.responseBreached}</strong>
            </div>

            <div className="sla-dashboard-item sla-dashboard-danger">
              <span>Resolution Breached</span>
              <strong>{slaStats.resolutionBreached}</strong>
            </div>
          </div>
        </section>

        <div className="recent-incidents">
          <div className="recent-incidents-header">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>Recent Incidents</h2>
            </div>
            <button onClick={() => navigate("/incident")}>View All</button>
          </div>

          <div className="recent-incidents-list">
            {
            recentIncidents.length === 0 ? (
              <p className="recent-empty">No incidents available</p>
            ) : (
              recentIncidents.map((item) => (
                <div key={item._id} className="recent-incident-row" onClick={() => navigate(`/incident/${item._id}`)}>
                  <div className="recent-incident-info">
                    <strong>{item.title}</strong>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="recent-incident-meta">
                    <span className={`severity severity-${item.severity.toLowerCase()}`}>{item.severity}</span>
                    <span className={`status status-${item.status}`}>{item.status}</span>
                  </div>
                </div>
              ))
            )
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard