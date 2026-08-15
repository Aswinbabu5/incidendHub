import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

interface Props {
    children: ReactNode
    allowedRoles: string[]
}

const RoleProtectedRoute = ({children, allowedRoles}: Props) => {

    const userData = localStorage.getItem("user")
    const user = userData ? JSON.parse(userData) : null

    if (!user) 
        return <Navigate to="/login" replace />
    
    if (!allowedRoles.includes(user.role)) 
        return <Navigate to="/dashboard" replace />
    
    return children
}

export default RoleProtectedRoute