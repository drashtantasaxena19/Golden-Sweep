export interface StoredProfile {
    id?: string
    fullName: string
    email: string
    phone?: string
    dob?: string
    country?: string
    state?: string
    language?: string
    avatar?: string
    verified?: boolean
    createdAt?: string
}

export interface StoredSession {
    email: string
    loggedInAt: string
}

export const getStoredProfile = (): StoredProfile | null => {
    try {
        const value = localStorage.getItem("goldensweep_profile")
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

export const getStoredSession = (): StoredSession | null => {
    try {
        const local = localStorage.getItem("goldensweep_session")
        const session = sessionStorage.getItem("goldensweep_session")
        const value = local || session
        return value ? JSON.parse(value) : null
    } catch {
        return null
    }
}

export const isAuthenticated = () => Boolean(getStoredSession())

export const clearAuth = () => {
    localStorage.removeItem("goldensweep_session")
    sessionStorage.removeItem("goldensweep_session")
}