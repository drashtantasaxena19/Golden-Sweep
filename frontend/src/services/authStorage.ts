export interface AuthUser {
    id: string
    full_name: string
    email: string
    role: string
    email_verified: boolean
}

export interface AuthTokens {
    access_token: string
    refresh_token: string
    token_type: string
}

const ACCESS_TOKEN_KEY =
    "goldensweep_access_token"

const REFRESH_TOKEN_KEY =
    "goldensweep_refresh_token"

const USER_KEY =
    "goldensweep_auth_user"

const REMEMBER_KEY =
    "goldensweep_remember"

const clearStorage = (storage: Storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(REFRESH_TOKEN_KEY)
    storage.removeItem(USER_KEY)
}

const activeStorage = (): Storage => {
    const remember =
        localStorage.getItem(REMEMBER_KEY) === "true"

    return remember
        ? localStorage
        : sessionStorage
}

export const saveAuth = (
    tokens: AuthTokens,
    user: AuthUser,
    remember = true,
) => {
    clearStorage(localStorage)
    clearStorage(sessionStorage)

    localStorage.setItem(
        REMEMBER_KEY,
        String(remember),
    )

    const storage = remember
        ? localStorage
        : sessionStorage

    storage.setItem(
        ACCESS_TOKEN_KEY,
        tokens.access_token,
    )

    storage.setItem(
        REFRESH_TOKEN_KEY,
        tokens.refresh_token,
    )

    storage.setItem(
        USER_KEY,
        JSON.stringify(user),
    )

    window.dispatchEvent(
        new Event("goldensweep-auth-change"),
    )
}

export const getAccessToken = (): string | null =>
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY)

export const getRefreshToken = (): string | null =>
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY)

export const getAuthUser = (): AuthUser | null => {
    try {
        const raw =
            localStorage.getItem(USER_KEY) ||
            sessionStorage.getItem(USER_KEY)

        if (!raw) return null

        const user = JSON.parse(raw) as AuthUser

        if (
            !user ||
            typeof user !== "object" ||
            !user.id ||
            !user.email
        ) {
            return null
        }

        return user
    } catch {
        return null
    }
}

export const updateAccessToken = (
    accessToken: string,
    refreshToken?: string,
) => {
    const storage = activeStorage()

    storage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken,
    )

    if (refreshToken) {
        storage.setItem(
            REFRESH_TOKEN_KEY,
            refreshToken,
        )
    }
}

export const updateAuthUser = (
    user: AuthUser,
) => {
    const storage = activeStorage()

    storage.setItem(
        USER_KEY,
        JSON.stringify(user),
    )

    window.dispatchEvent(
        new Event("goldensweep-auth-change"),
    )
}

export const isAuthenticated = (): boolean =>
    Boolean(getAccessToken())

export const clearAuth = () => {
    clearStorage(localStorage)
    clearStorage(sessionStorage)

    localStorage.removeItem(REMEMBER_KEY)

    window.dispatchEvent(
        new Event("goldensweep-auth-change"),
    )
}