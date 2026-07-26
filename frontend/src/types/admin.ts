export type AdminRole =
    | "admin"
    | "super_admin"

export type AccountStatus =
    | "active"
    | "suspended"
    | "blocked"

export interface AdminProfile {
    id: string
    full_name: string
    email: string
    role: AdminRole
    permissions: string[]
    account_status: AccountStatus
    email_verified: boolean
}

export interface AdminDashboardUserStats {
    total: number
    active: number
    suspended: number
    blocked: number
    verified: number
    unverified: number
    verification_rate: number
    active_user_rate: number
}

export interface AdminDashboardAdministratorStats {
    total_admins: number
    total_super_admins: number
    pending_requests: number
}

export interface AdminDashboardWalletStats {
    total_balance: number
    currency: string
}

export interface AdminDashboardGrowthStats {
    new_users_today: number
    new_users_this_week: number
    new_users_this_month: number
}

export interface AdminDashboardStats {
    users: AdminDashboardUserStats
    administrators: AdminDashboardAdministratorStats
    wallet: AdminDashboardWalletStats
    growth: AdminDashboardGrowthStats
    generated_at: string
}