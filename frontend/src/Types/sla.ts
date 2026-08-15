export type Status = "WITHIN_SLA" | "BREACHED" | "RESOLVED_WITHIN_SLA" | "RESOLVED_LATE"
export type St = "WITHIN_SLA" | "BREACHED"

export interface SLAData {
    incidentId: string
    severity: string

    response: {
        deadline: string | null
        respondedAt: string | null
        status: St
    }

    resolution: {
        deadline: string | null
        resolvedAt: string | null
        status: Status
    }
}