import { apiRequest } from "./api"

export interface UserProfile {
    id: string
    full_name: string
    email: string
    phone: string
    date_of_birth: string
    country: string
    state: string
    preferred_language: string
    avatar_url: string | null
    role: string
    account_status: string
    email_verified: boolean
    phone_verified: boolean
    wallet_balance: number
    wallet_currency: string
    created_at: string
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export const userService = {
    getMe: () => apiRequest<ApiResponse<UserProfile>>("/api/users/me"),

    changePassword: (
        currentPassword: string,
        newPassword: string
    ) =>
        apiRequest<ApiResponse<null>>(
            "/api/users/me/change-password",
            {
                method: "POST",
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            }
        ),
}
