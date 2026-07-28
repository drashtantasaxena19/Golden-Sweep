import { ArrowLeft, CheckCircle2, MailCheck, RefreshCw, ShieldCheck } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../../components/auth/AuthLayout"
import { ApiError } from "../../services/api"
import { authService } from "../../services/authService"
import { saveAuth } from "../../services/authStorage"

const CODE_LENGTH = 6
const RESEND_SECONDS = 45

const VerifyEmailPage = () => {
    const navigate = useNavigate()
    const inputRefs = useRef<Array<HTMLInputElement | null>>([])
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
    const [email] = useState(() => localStorage.getItem("goldensweep_pending_verification_email") || "")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [verified, setVerified] = useState(false)
    const [resending, setResending] = useState(false)
    const [countdown, setCountdown] = useState(RESEND_SECONDS)

    const maskedEmail = (() => {
        const [name, domain] = email.split("@")
        if (!name || !domain) return email
        const visible = name.slice(0, Math.min(2, name.length))
        return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`
    })()

    useEffect(() => {
        if (!email) navigate("/signup", { replace: true })
    }, [email, navigate])

    useEffect(() => {
        if (countdown <= 0) return
        const timer = window.setInterval(() => setCountdown(current => current - 1), 1000)
        return () => window.clearInterval(timer)
    }, [countdown])

    const updateDigit = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1)
        const next = [...code]
        next[index] = digit
        setCode(next)
        setError("")
        if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus()
        if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus()
        if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault()
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH)
        if (!pasted) return
        const next = Array(CODE_LENGTH).fill("")
        pasted.split("").forEach((digit, index) => { next[index] = digit })
        setCode(next)
        setError("")
        inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
    }

    const handleVerify = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        const verificationCode = code.join("")
        if (verificationCode.length !== CODE_LENGTH) {
            setError("Enter the complete 6-digit verification code.")
            return
        }

        setLoading(true)
        setError("")
        try {
            const response = await authService.verifyEmail(email, verificationCode)
            saveAuth({
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                token_type: response.data.token_type,
            }, response.data.user, true)

            localStorage.removeItem("goldensweep_pending_verification_email")
            setVerified(true)
            window.setTimeout(() => navigate("/profile"), 1800)
        } catch (error) {
            setError(error instanceof ApiError ? error.message : "Unable to verify your email.")
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (countdown > 0 || resending) return
        setResending(true)
        setError("")
        try {
            setCode(Array(CODE_LENGTH).fill(""))
            setCountdown(RESEND_SECONDS)
            window.setTimeout(() => inputRefs.current[0]?.focus(), 50)
        } catch (error) {
            setError(error instanceof ApiError ? error.message : "Unable to resend verification code.")
        } finally {
            setResending(false)
        }
    }

    if (verified) {
        return (
            <AuthLayout
                eyebrow="EMAIL VERIFIED"
                title="You're officially golden"
                description="Your email has been successfully verified. We're preparing your GoldenSweep profile now."
                footerText="Need help?"
                footerLinkText="Contact support"
                footerLinkTo="/support"
            >
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="relative flex h-[130px] w-[130px] items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.05] shadow-[0_0_45px_rgba(52,211,153,.08)]">
                            <MailCheck size={52} strokeWidth={1.4} className="text-gold-300" />
                            <div className="absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-[#070812] bg-emerald-500 text-black">
                                <CheckCircle2 size={26} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-white">Verification complete</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                            Your email address has been confirmed successfully. You'll be redirected to your profile automatically.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 rounded-xl border border-gold-400/15 bg-gold-400/[0.035] px-4 py-3 text-xs text-white/45">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold-300/25 border-t-gold-300" />
                        Opening your GoldenSweep profile...
                    </div>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            eyebrow="VERIFY YOUR EMAIL"
            title="Enter your verification code"
            description="We sent a 6-digit verification code to your registered email address. Enter it below to activate your GoldenSweep account."
            footerText="Wrong email address?"
            footerLinkText="Create account again"
            footerLinkTo="/signup"
        >
            <form onSubmit={handleVerify} className="space-y-6" noValidate>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/[0.05] text-gold-300">
                        <MailCheck size={24} />
                    </div>
                    <p className="mt-3 text-xs text-white/35">Verification code sent to</p>
                    <p className="mt-1 text-sm font-black text-white">{maskedEmail}</p>
                </div>

                <div onPaste={handlePaste} className="flex justify-center gap-2.5 sm:gap-3">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={element => { inputRefs.current[index] = element }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            value={digit}
                            onChange={event => updateDigit(index, event.target.value)}
                            onKeyDown={event => handleKeyDown(event, index)}
                            aria-label={`Verification digit ${index + 1}`}
                            className={`h-[58px] w-[48px] rounded-xl border bg-black/30 text-center text-xl font-black text-white outline-none transition sm:h-[64px] sm:w-[56px] ${
                                error ? "border-red-400/45" : digit
                                    ? "border-gold-400/55 shadow-[0_0_18px_rgba(255,184,0,.07)]"
                                    : "border-white/[0.1] focus:border-gold-400/55"
                            }`}
                        />
                    ))}
                </div>

                {error && <p className="text-center text-xs text-red-300">{error}</p>}

                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                    <div className="flex items-start gap-3">
                        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold-400" />
                        <div>
                            <p className="text-xs font-bold text-white/70">Keep your code private</p>
                            <p className="mt-1 text-[11px] leading-5 text-white/35">
                                GoldenSweep support should never ask you to share your verification code, password, or full payment credentials.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative flex h-[56px] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-sm font-black uppercase tracking-[0.04em] text-[#171006] shadow-[0_0_28px_rgba(255,184,0,.18)] transition hover:scale-[1.01] hover:shadow-[0_0_38px_rgba(255,184,0,.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <span className="flex items-center gap-3">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                            VERIFYING...
                        </span>
                    ) : "VERIFY EMAIL"}
                    <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
                </button>

                <div className="text-center">
                    <p className="text-xs text-white/35">Didn't receive the code?</p>
                    <button
                        type="button"
                        disabled={countdown > 0 || resending}
                        onClick={handleResend}
                        className="mt-2 inline-flex items-center gap-2 text-xs font-black text-gold-300 transition hover:text-gold-200 disabled:cursor-not-allowed disabled:text-white/25"
                    >
                        <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                        {resending ? "SENDING..." : countdown > 0 ? `RESEND IN ${countdown}s` : "RESEND CODE"}
                    </button>
                </div>

                <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 border-t border-white/[0.06] pt-5 text-xs font-semibold text-white/40 transition hover:text-gold-300"
                >
                    <ArrowLeft size={15} /> Back to Sign Up
                </Link>
            </form>
        </AuthLayout>
    )
}

export default VerifyEmailPage