export type userRole = "admin" | "engineer" | "viewer"

export interface User {
    id: string
    name: string
    email: string
    role: userRole
}