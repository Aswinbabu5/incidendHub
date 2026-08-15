import type { User } from "./auth"

export type Severity = "Pos1" | "Pos2" | "Pos3" | "Pos4"
export type Status = "open" | "investigating" | "resolved" | "closed"

export interface Incidents {
    _id: string
    title: string
    desc: string
    severity: Severity
    status: Status
    assignedTo: User | null
    createdBy: User
    rootCauseAnalysis: string
    resolution: string
    responseDeadline: string | null
    respondedAt: string | null
    resolutionDeadline: string | null
    resolvedAt: string | null
    createdAt: string
    updatedAt: string
}
