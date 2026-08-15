import type { IncidentList } from "../Types/IncidentList";
import type { IncidentQuery } from "../Types/IncidentQuery";
import type { Incidents } from "../Types/Incidents";
import api from "./api";

const getIncident = async (params: IncidentQuery = {}): Promise<IncidentList> => {
    const res = await api.get<IncidentList>("/incident", { params })
    return res.data
}

export const getIncidentById = async (id: string): Promise<Incidents> => {
    const res = await api.get(`/incident/${id}`)
    return res.data.incident
}

export const UpdateIncident = async (id: string, data: {
    severity?: string
    status?: string
    rootCauseAnalysis?: string
    resolution?: string
}) => {
    const res = await api.put(`/incident/${id}`, data)
    return res.data
}

export const assignMem = async (id: string, userId: string) => {
    const res = await api.put(`/incident/${id}/assign`, { userId })
    return res.data
}

export const cretIncident = async (data: {
    title: string
    desc: string
    severity: string
}) => {
    const res = await api.post("/incident", data)
    return res.data
}

export const getMyIncident = async () => {
    const res = await api.get(`/incident/my-incident`)
    return res.data.incident
}

export default getIncident
