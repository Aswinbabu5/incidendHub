import type { User } from './auth'

export interface LoginReq {
    email: string
    password: string
}

export interface LoginRes {
    message: string
    token: string
    User: User
}