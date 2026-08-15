// import React from 'react'
import api from './api'
import type { IncidentStats } from '../Types/analytics'

const getIncidentStats = async (): Promise<IncidentStats> => {
    const res = await api.get<IncidentStats>("/incident/stats")
    return res.data
}

export default getIncidentStats
