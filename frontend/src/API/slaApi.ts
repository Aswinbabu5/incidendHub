import type { SLAData } from "../Types/sla";
import api from "./api";

export const getIncidentSLA = async (incidentId: string): Promise<SLAData> => {
    const res = await api.get(`/incident/${incidentId}/sla`)
    return res.data
}