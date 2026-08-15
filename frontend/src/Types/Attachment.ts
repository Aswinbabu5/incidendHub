export interface Attachment {
    _id: string
    incident: string
    uploadBy: string
    originalName: string
    fileName: string
    filePath: string
    mimeType: string
    fileType?: string
    fileSize?: number
    createdAt: string
}