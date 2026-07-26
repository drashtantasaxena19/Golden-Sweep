export interface UserSummary {
    id: string
    full_name: string
    email: string
    phone?: string
    role: string
    account_status: string
    email_verified: boolean
    preferred_language?: string
    country?: string
    state?: string
    wallet_balance: number
    wallet_currency: string
    created_at: string
    last_login_at?: string | null
}

export interface UserListResponse {
    total: number
    page: number
    limit: number
    users: UserSummary[]
}

export interface UserStatistics {
    total_users: number
    active_users: number
    inactive_users: number
    suspended_users: number
    verified_users: number
    unverified_users: number
    admin_users: number
    player_users: number
    super_admin_users: number
}

export interface UserFilterRequest {
    search?: string
    role?: string
    account_status?: string
    email_verified?: boolean
    country?: string
    page?: number
    limit?: number
}

export interface UserStatusUpdateRequest {
    account_status: "active" | "inactive" | "suspended" | string
}

export interface UserRoleUpdateRequest {
    role: "player" | "admin" | "super_admin" | string
}

export interface WalletAdjustmentRequest {
    amount: number
}

export interface ApiMessageResponse {
    message: string
}

export interface RoleCount {
    role: string
    count: number
}

export interface StatusCount {
    account_status: string
    count: number
}