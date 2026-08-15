import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login/Login"
import Dashboard from "../pages/Dashboard/Dashboard"
import Incident from "../pages/Incident/Incident"
import ProtectedRoute from "./ProtectedRoute"
import IncidentDetail from "../pages/IncidentDetail/IncidentDetail"
import CreateIncident from "../pages/CreateIncident/CreateIncident"
import RoleProtectedRoute from "./RoleProtectedRoute"
import Analytics from "../pages/Analytics/Analytics"
import Register from "../pages/Register/Register"

const Connect = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/incident" element={<ProtectedRoute><Incident /></ProtectedRoute>} />
          <Route path="/incident/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
          <Route path="/incident/create" element={<ProtectedRoute><RoleProtectedRoute allowedRoles={["admin", "engineer"]}><CreateIncident /></RoleProtectedRoute></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default Connect
