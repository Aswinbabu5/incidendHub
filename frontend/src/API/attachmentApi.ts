import type { Attachment } from "../Types/Attachment"
import api from "./api"

export const getAttachment = async (incidentId: string): Promise<Attachment[]> => {
    const res = await api.get(`/incident/${incidentId}/attachment`)
    // console.log("API RES: ", res.data)
    return res.data.attachment
}

export const uploadAttachment = async (incidentId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await api.post(`/incident/${incidentId}/attachment`, formData)
    return res.data
}

export const downloadAttachment = async (attachmentId: string) => {
    const res = await api.get(`/incident/attachment/${attachmentId}/download`, { responseType: "blob" })
    return res.data
}

export const deleteAttachment = async (attachmentId: string) => {
    const res = await api.delete(`/incident/attachment/${attachmentId}`)
    return res.data
}