export interface ActiveUser {
    _id: string
    name: string
    email: string
    role: string
}

export interface Activity {
    _id: string
    incident: string
    user: ActiveUser
    actions: string
    msg: string
    createdAt: string
    updatedAt: string
}