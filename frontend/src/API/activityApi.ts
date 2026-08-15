import type { Activity } from "../Types/Activity";
import api from "./api";

export const getIncidentActive = async (incidentId: string): Promise<Activity[]> => {
    const res = await api.get(`/incident/${incidentId}/activite`)
    // console.log("API RES: ", res)
    return res.data.activites
}