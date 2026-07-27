import type { ReactNode } from "react"
import {
    Navigate,
    useLocation,
} from "react-router-dom"

import { isAuthenticated } from "../services/authStorage"

type ProtectedGameRouteProps = {
    children: ReactNode
}

const ProtectedGameRoute = ({
    children,
}: ProtectedGameRouteProps) => {
    const location = useLocation()

    if (!isAuthenticated()) {
        const redirectPath =
            `${location.pathname}${location.search}`

        return (
            <Navigate
                to={`/login?redirect=${encodeURIComponent(
                    redirectPath
                )}`}
                replace
            />
        )
    }

    return children
}

export default ProtectedGameRoute