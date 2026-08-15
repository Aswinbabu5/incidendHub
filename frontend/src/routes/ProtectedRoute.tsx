import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRoute {
    children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRoute) => {
    const token = localStorage.getItem("token")
    if(!token) 
        return <Navigate to="/" replace />

    return children
}

export default ProtectedRoute
