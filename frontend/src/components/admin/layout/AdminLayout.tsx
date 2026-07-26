import { useState } from "react"
import { Outlet, useOutletContext } from "react-router-dom"

import type { AdminOutletContext } from "../../../routes/AdminRoute"
import AdminFooter from "./AdminFooter"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = () => {
    const { admin } = useOutletContext<AdminOutletContext>()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-[#020309] text-white">
            <AdminSidebar
                admin={admin}
                mobileOpen={sidebarOpen}
                collapsed={sidebarCollapsed}
                onClose={() => setSidebarOpen(false)}
                onToggleCollapse={() =>
                    setSidebarCollapsed(current => !current)
                }
            />

            <div
                className={`flex min-h-screen flex-col transition-[margin] duration-300 ${
                    sidebarCollapsed
                        ? "lg:ml-[88px]"
                        : "lg:ml-[280px]"
                }`}
            >
                <AdminNavbar
                    admin={admin}
                    sidebarCollapsed={sidebarCollapsed}
                    onOpenSidebar={() => setSidebarOpen(true)}
                    onToggleSidebar={() =>
                        setSidebarCollapsed(current => !current)
                    }
                />

                <main className="flex-1">
                    <Outlet context={{ admin }} />
                </main>

                <AdminFooter />
            </div>
        </div>
    )
}

export default AdminLayout