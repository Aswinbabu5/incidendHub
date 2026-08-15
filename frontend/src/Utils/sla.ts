import type { Incidents } from "../Types/Incidents"

export const getSlaStatus = (incident: Incidents, now: Date) => {
    const responseBreached = incident.responseDeadline && !incident.respondedAt && now > new Date(incident.responseDeadline)
    const resolutionBreached = incident.resolutionDeadline && !incident.resolvedAt && now > new Date(incident.resolutionDeadline)

    if (resolutionBreached) 
        return "resolution-breached"
    
    if (responseBreached) 
        return "response-breached"
    
    return "within-sla"
}