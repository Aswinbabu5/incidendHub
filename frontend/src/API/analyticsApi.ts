import type { SeverityAnalyticsResponse } from "../Types/SevAnalytics";
import api from "./api";

export const getSeverityAnalytics = async (): Promise<SeverityAnalyticsResponse> => {
    const res = await api.get("/incident/analytics/severity")
    return res.data
}

export const getResolutionAnalytics = async () => {
    const res = await api.get("/incident/analytics/resoln-time")
    return res.data
}

export const getEngineerWorkload = async () => {
    const res = await api.get("/incident/analytics/engineer-workload")
    return res.data
}

export const getSlaAnalytics = async () => {
    const res = await api.get("/incident/analytics/sla")
    return res.data
}

export const getIncidentsPerDay = async () => {
    const res = await api.get("/incident/analytics/incident-per-day")
    return res.data
}