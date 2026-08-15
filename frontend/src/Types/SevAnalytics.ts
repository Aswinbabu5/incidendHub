export interface SeverityAnalyticsItem {
    _id: string
    count: number
}

export interface SeverityAnalyticsResponse {
    severityData: SeverityAnalyticsItem[]
}

export interface IncidentPerDayItem {
    count: number
    date: string
}

export interface IncidentPerDayResponse {
    incidentsPerDay: IncidentPerDayItem[]
}

export interface SlaGroup {
    withinSla: number
    breached: number
}

export interface SlaAnalyticsResponse {
    responseSla: SlaGroup
    resolutionSla: SlaGroup
}

export interface ResolutionAnalyticsResponse {
    analytics: {
        averageResolutionTimeMs: number
        averageResolutionTimeMinutes: number
    }
}

export interface EngineerWorkloadItem {
    activeIncidents: number
    engineerId: string
    name: string
    email: string
}

export interface EngineerWorkloadResponse {
    workload: EngineerWorkloadItem[]
}