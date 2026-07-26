import { apiRequest } from "./api"

export interface RegisterPayload {
    full_name: string
    email: string
    phone: string
    date_of_birth: string
    country: string
    state: string
    preferred_language: string
    password: string
    age_confirmed: boolean
    terms_accepted: boolean
}

export interface AuthUser {
    id: string
    full_name: string
    email: string
    role: string
    email_verified: boolean
}

export interface AuthResult {
    access_token: string
    refresh_token: string
    token_type: string
    user: AuthUser
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface RegisterResult {
    user_id: string
    email: string
    verification_required: boolean
    development_otp?: string
}

export interface VerificationResult {
    email: string
    message: string
    development_otp?: string
}

export const authService = {
    register(
        payload: RegisterPayload,
    ): Promise<ApiResponse<RegisterResult>> {
        return apiRequest<ApiResponse<RegisterResult>>(
            "/api/auth/register",
            {
                method: "POST",
                body: JSON.stringify(payload),
                skipAuth: true,
            },
        )
    },

    verifyEmail(
        email: string,
        code: string,
    ): Promise<ApiResponse<AuthResult>> {
        return apiRequest<ApiResponse<AuthResult>>(
            "/api/auth/verify-email",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code: code.trim(),
                }),
                skipAuth: true,
            },
        )
    },

    resendVerification(
        email: string,
    ): Promise<ApiResponse<VerificationResult>> {
        return apiRequest<
            ApiResponse<VerificationResult>
        >("/api/auth/resend-code", {
            method: "POST",
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
            }),
            skipAuth: true,
        })
    },

    forgotPassword(
        email: string,
    ): Promise<ApiResponse<null>> {
        return apiRequest<ApiResponse<null>>(
            "/api/auth/forgot-password",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
                skipAuth: true,
            },
        )
    },

    resetPassword(
        email: string,
        code: string,
        newPassword: string,
    ): Promise<ApiResponse<null>> {
        return apiRequest<ApiResponse<null>>(
            "/api/auth/reset-password",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code: code.trim(),
                    new_password: newPassword,
                }),
                skipAuth: true,
            },
        )
    },

    login(
        email: string,
        password: string,
    ): Promise<ApiResponse<AuthResult>> {
        return apiRequest<ApiResponse<AuthResult>>(
            "/api/auth/login",
            {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
                skipAuth: true,
            },
        )
    },

    logout(): Promise<ApiResponse<null>> {
        return apiRequest<ApiResponse<null>>(
            "/api/auth/logout",
            {
                method: "POST",
                skipRefresh: true,
            },
        )
    },
}

export default authService