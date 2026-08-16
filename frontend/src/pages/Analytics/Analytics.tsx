import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar/Navbar"

import {
    getSlaAnalytics,
    getResolutionAnalytics,
    getEngineerWorkload,
    getSeverityAnalytics,
    getIncidentsPerDay
} from "../../API/analyticsApi"

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"
import "./Analytics.css"
import type { EngineerWorkloadItem, IncidentPerDayItem, SeverityAnalyticsItem } from "../../Types/SevAnalytics"
import { getErrorMessage } from "../../Utils/errorHandler"
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage"
import Loading from "../../components/Loading/Loading"
const slaColor = ["#16a34a", "#dc2626", "#22c55e", "#ef4444"]
const severityColor = ["#dc2626", "#f97316", "#eab308", "#16a34a"]
const workloadColor = ["#2563eb", "#7c3aed", "#0891b2", "#0f766e", "#c2410c"]
const Analytics = () => {
    const [severity, setSeverity] = useState<SeverityAnalyticsItem[]>([])
    const [incidentsPerDay, setIncidentsPerDay] = useState<IncidentPerDayItem[]>([])
    const [sla, setSla] = useState<{ name: string; value: number }[]>([])
    const [resolution, setResolution] = useState<{ name: string; minutes: number }[]>([])
    const [workload, setWorkload] = useState<EngineerWorkloadItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true)
                setError("")

                const [
                    severityRes,
                    perDayRes,
                    slaRes,
                    resolutionRes,
                    workloadRes
                ] = await Promise.all([
                    getSeverityAnalytics(),
                    getIncidentsPerDay(),
                    getSlaAnalytics(),
                    getResolutionAnalytics(),
                    getEngineerWorkload()
                ])
                setSeverity(severityRes.severityData)
                setIncidentsPerDay(perDayRes.incidentsPerDay)
                setSla([
                    {
                        name: "Response Within SLA",
                        value: slaRes.responseSla.withinSla
                    },
                    {
                        name: "Response Breached",
                        value: slaRes.responseSla.breached
                    },
                    {
                        name: "Resolution Within SLA",
                        value: slaRes.resolutionSla.withinSla
                    },
                    {
                        name: "Resolution Breached",
                        value: slaRes.resolutionSla.breached
                    }
                ])
                setResolution([
                    {
                        name: "Average Resolution",
                        minutes: resolutionRes.analytics.averageResolutionTimeMinutes
                    }
                ])
                setWorkload(workloadRes.workload)
            }
            catch (error) {
                setError(getErrorMessage(error, "Failed to load analytics"))
            }
            finally {
                setLoading(false)
            }
        }
        fetchAnalytics()

    }, [])

    const averageMinutes = resolution[0]?.minutes ?? 0
    const averageHours = Math.floor(averageMinutes / 60)
    const remainingMinutes = Math.round(averageMinutes % 60)

    if (loading) {
        return (
            <>
                <Navbar />
                <Loading text="Loading Analytics..."/>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Navbar />
                <ErrorMessage message={error}/>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className="analytics-page">
                <div className="analytics-header">
                    <p className="analytics-eyebrow">Operation Insights</p>
                    <h1>Incident Analytics</h1>
                    <p>
                        Monitor incident patterns, SLA performance
                        and engineering workload.
                    </p>
                </div>

                <div className="analytics-grid">
                    <div className="analytics-card">
                        <div className="chart-header">
                            <h2>Severity Distribution</h2>
                            <p>Incidents grouped by severity </p>
                        </div>

                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={severity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="_id" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
                                        {
                                            severity.map((_, index) => (
                                                <Cell key={index} fill={severityColor[index % severityColor.length]} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="chart-header">
                            <h2>Incidents Over Time</h2>
                            <p>Daily incident creation trend</p>
                        </div>

                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={incidentsPerDay}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) =>
                                            new Date(value).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short"
                                            })
                                        }
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip
                                        labelFormatter={(value) =>
                                            new Date(String(value)).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            })
                                        }
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Incidents"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: "#2563eb"
                                        }}
                                        activeDot={{
                                            r: 6
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="chart-header">
                            <h2>SLA Performance</h2>
                            <p>Overall SLA compliance</p>
                        </div>

                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sla}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                    >
                                        {
                                            sla.map((_, index) => (
                                                <Cell key={index} fill={slaColor[index % slaColor.length]} />
                                            ))
                                        }
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="chart-header">
                            <h2>Resolution Performance</h2>
                            <p>Average incident resolution time</p>
                        </div>

                        <div className="resolution-kpi">
                            <span>Average Resolution Time</span>
                            <strong>{averageHours}h {remainingMinutes}m</strong>
                            <p>{averageMinutes.toFixed(2)} total minutes</p>
                        </div>
                    </div>

                    <div className="analytics-card analytics-wide">
                        <div className="chart-header">
                            <h2>Engineer Workload</h2>
                            <p>Active incidents currently assigned to engineers</p>
                        </div>

                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workload}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="activeIncidents" name="Active Incidents" radius={[6, 6, 0, 0]}>
                                        {
                                            workload.map((_, index) => (
                                                <Cell key={index} fill={workloadColor[index % workloadColor.length]} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="workload-summary">
                            {
                                workload.map((engineer) => (
                                    <div className="workload-summary-item" key={engineer.engineerId}>
                                        <div>
                                            <strong>{engineer.name}</strong>
                                            <span>{engineer.email}</span>
                                        </div>

                                        <div className="workload-count">
                                            {engineer.activeIncidents}
                                            <span>active</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Analytics