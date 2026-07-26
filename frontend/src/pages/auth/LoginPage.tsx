import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { useState } from "react"
import type { SyntheticEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../../components/auth/AuthLayout"
import { ApiError } from "../../services/api"
import { authService } from "../../services/authService"
import { saveAuth } from "../../services/authStorage"

interface LoginErrors {
    email?: string
    password?: string
    general?: string
}


const LoginPage = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [remember, setRemember] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<LoginErrors>({})
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const nextErrors: LoginErrors = {}
        const normalizedEmail = email.trim()
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!normalizedEmail) {
            nextErrors.email = "Email is required."
        } else if (!emailPattern.test(normalizedEmail)) {
            nextErrors.email = "Enter a valid email address."
        }

        if (!password) {
            nextErrors.password = "Password is required."
        } else if (password.length < 8) {
            nextErrors.password =
                "Password must contain at least 8 characters."
        }

        setErrors(nextErrors)

        return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!validate()) return
        setLoading(true)
        setErrors({})

        try {
            const normalizedEmail = email.trim().toLowerCase()
            const response = await authService.login(normalizedEmail, password)
            const authenticatedUser = response.data.user

            saveAuth(
                {
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                    token_type: response.data.token_type,
                },
                authenticatedUser,
                remember,
            )

            const role = authenticatedUser?.role?.toLowerCase()

            if (role === "admin" || role === "super_admin") {
                navigate("/admin", { replace: true })
                return
            }

            navigate("/profile", { replace: true })
        } catch (error) {
            if (error instanceof ApiError && error.status === 403 && error.message === "EMAIL_NOT_VERIFIED") {
                localStorage.setItem("goldensweep_pending_verification_email", email.trim().toLowerCase())
                navigate("/verify-email")
                return
            }
            setErrors({ general: error instanceof ApiError ? error.message : "Unable to sign in right now. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            mode="login"
            eyebrow="WELCOME BACK"
            title="Sign in to GoldenSweep"
            description="Access your wallet, gaming worlds, recharge activity, rewards, and account settings."
            footerText="New to GoldenSweep?"
            footerLinkText="Create account"
            footerLinkTo="/signup"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
            >
                {errors.general && (
                    <div className="rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm leading-6 text-red-200">
                        {
                            errors.general
                        }
                    </div>
                )}

                <div>
                    <label
                        htmlFor="email"
                        className="text-xs font-black uppercase tracking-[0.12em] text-white/60"
                    >
                        Email Address
                    </label>

                    <div
                        className={`mt-2 flex h-[54px] items-center rounded-xl border bg-black/25 px-4 transition ${errors.email
                            ? "border-red-400/50"
                            : "border-white/[0.09] focus-within:border-gold-400/45"
                            }`}
                    >
                        <Mail
                            size={19}
                            className="shrink-0 text-gold-400/80"
                        />

                        <input
                            id="email"
                            type="email"
                            value={email}
                            autoComplete="email"
                            onChange={event => {
                                setEmail(
                                    event.target
                                        .value
                                )

                                if (
                                    errors.email ||
                                    errors.general
                                ) {
                                    setErrors(
                                        current => ({
                                            ...current,
                                            email:
                                                undefined,
                                            general:
                                                undefined,
                                        })
                                    )
                                }
                            }}
                            placeholder="you@example.com"
                            className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25"
                        />
                    </div>

                    {errors.email && (
                        <p className="mt-1.5 text-xs text-red-300">
                            {
                                errors.email
                            }
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-xs font-black uppercase tracking-[0.12em] text-white/60"
                        >
                            Password
                        </label>

                        <Link
                            to="/forgot-password"
                            className="text-xs font-semibold text-gold-300 transition hover:text-gold-200"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <div
                        className={`mt-2 flex h-[54px] items-center rounded-xl border bg-black/25 px-4 transition ${errors.password
                            ? "border-red-400/50"
                            : "border-white/[0.09] focus-within:border-gold-400/45"
                            }`}
                    >
                        <LockKeyhole
                            size={19}
                            className="shrink-0 text-gold-400/80"
                        />

                        <input
                            id="password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            value={password}
                            autoComplete="current-password"
                            onChange={event => {
                                setPassword(
                                    event.target
                                        .value
                                )

                                if (
                                    errors.password ||
                                    errors.general
                                ) {
                                    setErrors(
                                        current => ({
                                            ...current,
                                            password:
                                                undefined,
                                            general:
                                                undefined,
                                        })
                                    )
                                }
                            }}
                            placeholder="Enter your password"
                            className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    current =>
                                        !current
                                )
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                            className="text-white/35 transition hover:text-gold-300"
                        >
                            {showPassword ? (
                                <EyeOff
                                    size={19}
                                />
                            ) : (
                                <Eye
                                    size={19}
                                />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="mt-1.5 text-xs text-red-300">
                            {
                                errors.password
                            }
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/50">
                        <input
                            type="checkbox"
                            checked={
                                remember
                            }
                            onChange={event =>
                                setRemember(
                                    event.target
                                        .checked
                                )
                            }
                            className="h-4 w-4 accent-[#e5ae2d]"
                        />

                        Remember me
                    </label>

                    <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                        <ShieldCheck
                            size={14}
                            className="text-gold-400/70"
                        />

                        Secure sign in
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative flex h-[54px] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-sm font-black text-[#171006] shadow-[0_0_28px_rgba(255,184,0,.2)] transition hover:scale-[1.01] hover:shadow-[0_0_38px_rgba(255,184,0,.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <span className="flex items-center gap-3">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />

                            SIGNING IN...
                        </span>
                    ) : (
                        "SIGN IN"
                    )}

                    <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                </button>

                <div className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-white/[0.07]" />

                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                        Secure Access
                    </span>

                    <span className="h-px flex-1 bg-white/[0.07]" />
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                    <p className="text-xs leading-5 text-white/35">
                        By signing in, you
                        agree to GoldenSweep's{" "}
                        <Link
                            to="/terms"
                            className="text-gold-300 hover:text-gold-200"
                        >
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                            to="/privacy"
                            className="text-gold-300 hover:text-gold-200"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </form>
        </AuthLayout>
    )
}

export default LoginPage