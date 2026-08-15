import type { Incidents } from "./Incidents"

export interface IncidentList {
    total: number
    page: number
    limit: number
    totalPages: number
    incident: Incidents[]
}