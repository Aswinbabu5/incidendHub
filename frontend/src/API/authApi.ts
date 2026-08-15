import api from './api'
import type { LoginReq, LoginRes } from '../Types/LoginFlow'
import type { Engineer } from '../Types/Engineer'

export const loginUser = async (loginData: LoginReq): Promise<LoginRes> => {
    const res = await api.post<LoginRes>("/auth/login", loginData)
    return res.data
}

export const getEngineer = async (): Promise<Engineer[]> => {
    const res = await api.get("/auth/engineer")
    // console.log("API res: ", res)
    return res.data.Engineer
}