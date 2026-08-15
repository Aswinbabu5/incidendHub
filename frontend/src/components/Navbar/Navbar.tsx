// import React from 'react'
import { NavLink, useNavigate } from "react-router-dom"
import './Navbar.css'

const Navbar = () => {
    const navigate = useNavigate()

    const userData = localStorage.getItem("user")
    const user = userData ? JSON.parse(userData) : null

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        navigate("/")
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">IncidentHub</div>
            <div className="navbar-links">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
                <NavLink to="/incident" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Incident</NavLink>
                <NavLink to="/analytics" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Analytics</NavLink>
            </div>
            <div className="navbar-user">
                <div className="navbar-user-info">
                    <span className="navbar-user-name">{user?.name || "User"}</span>
                    <span className="navbar-user-role">{user?.role || ""}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>LogOut</button>
            </div>
        </nav>
    )
}

export default Navbar
