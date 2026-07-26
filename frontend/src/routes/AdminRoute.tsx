import { LoaderCircle, ShieldX } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, Outlet } from "react-router-dom"

import { ApiError } from "../services/api"
import adminService from "../services/adminService"
import type { AdminProfile } from "../types/admin"

export interface AdminOutletContext {
    admin: AdminProfile
}

const AdminRoute = () => {
    const [admin, setAdmin] = useState<AdminProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [unauthenticated, setUnauthenticated] = useState(false)
    const [forbidden, setForbidden] = useState(false)

    useEffect(() => {
        let mounted = true

        const loadAdmin = async () => {
            try {
                const data = await adminService.getMe()

                if (!mounted) return

                const normalizedRole = data?.role?.toLowerCase()

                if (
                    !data ||
                    !["admin", "super_admin"].includes(normalizedRole)
                ) {
                    setForbidden(true)
                    return
                }

                setAdmin({
                    ...data,
                    role: normalizedRole as AdminProfile["role"],
                })
            } catch (error) {
                if (!mounted) return

                if (
                    error instanceof ApiError &&
                    error.status === 401
                ) {
                    setUnauthenticated(true)
                    return
                }

                setForbidden(true)
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        void loadAdmin()

        return () => {
            mounted = false
        }
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020309]">
                <div className="text-center">
                    <LoaderCircle
                        size={36}
                        className="mx-auto animate-spin text-[#f4c34c]"
                    />

                    <p className="mt-4 text-sm text-white/45">
                        Verifying administrator access...
                    </p>
                </div>
            </div>
        )
    }

    if (unauthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: "/admin" }}
            />
        )
    }

    if (
        forbidden ||
        !admin ||
        !["admin", "super_admin"].includes(admin.role)
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020309] px-5">
                <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#080a12] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,.55)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/[0.06]">
                        <ShieldX
                            size={30}
                            className="text-red-300"
                        />
                    </div>

                    <h1 className="mt-5 text-2xl font-black text-white">
                        Access Denied
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-white/45">
                        Your account does not have permission to access
                        the GoldenSweep administration console.
                    </p>

                    <Link
                        to="/"
                        className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] px-6 text-sm font-black text-black transition hover:scale-[1.02]"
                    >
                        RETURN HOME
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <Outlet context={{ admin } satisfies AdminOutletContext} />
    )
}

export default AdminRoute