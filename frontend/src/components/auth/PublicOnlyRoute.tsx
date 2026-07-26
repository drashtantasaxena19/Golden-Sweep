import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { isAuthenticated } from "../../services/authStorage"

const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
    if (isAuthenticated()) return <Navigate to="/profile" replace />
    return children
}

export default PublicOnlyRoute
