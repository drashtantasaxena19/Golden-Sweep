import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, RotateCcw, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../../components/auth/AuthLayout"
import { ApiError } from "../../services/api"
import { authService } from "../../services/authService"

const CODE_LENGTH = 6

type Step = "request" | "reset" | "success"

const ForgotPasswordPage = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>("request")
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const normalizedEmail = email.trim().toLowerCase()
    const maskedEmail = (() => {
        const [name, domain] = normalizedEmail.split("@")
        if (!name || !domain) return normalizedEmail
        const visible = name.slice(0, Math.min(2, name.length))
        return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`
    })()

    const requestReset = async (event?: React.SyntheticEvent<HTMLFormElement>) => {
        event?.preventDefault()
        setError("")
        setMessage("")
        if (!normalizedEmail) return setError("Email address is required.")
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError("Enter a valid email address.")

        setLoading(true)
        try {
            await authService.forgotPassword(normalizedEmail)
            setStep("reset")
            setMessage(`A 6-digit reset code has been sent to ${maskedEmail}.`)
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to send the password reset code. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError("")
        setMessage("")

        if (!/^\d{6}$/.test(code)) return setError("Enter the complete 6-digit reset code.")
        if (newPassword.length < 8) return setError("New password must contain at least 8 characters.")
        if (newPassword !== confirmPassword) return setError("Passwords do not match.")

        setLoading(true)
        try {
            await authService.resetPassword(normalizedEmail, code, newPassword)
            setStep("success")
            setMessage("Your password has been reset successfully.")
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to reset your password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const resend = async () => {
        if (loading) return
        setLoading(true)
        setError("")
        setMessage("")
        try {
            await authService.forgotPassword(normalizedEmail)
            setMessage(`A new reset code has been sent to ${maskedEmail}.`)
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to resend the reset code. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            eyebrow={step === "request" ? "ACCOUNT RECOVERY" : step === "reset" ? "SECURITY VERIFICATION" : "PASSWORD UPDATED"}
            title={step === "request" ? "Forgot your password?" : step === "reset" ? "Create a new password" : "Password reset complete"}
            description={step === "request"
                ? "Enter the email connected to your GoldenSweep account and we'll send a secure reset code."
                : step === "reset"
                    ? `Enter the 6-digit code sent to ${maskedEmail}, then choose your new password.`
                    : "Your GoldenSweep password has been changed successfully. You can now sign in with your new password."}
            footerText="Remembered your password?"
            footerLinkText="Sign in"
            footerLinkTo="/login"
        >
            {error && <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">{error}</div>}
            {message && <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] px-4 py-3 text-sm text-emerald-200"><CheckCircle2 size={17} />{message}</div>}

            {step === "request" && (
                <form onSubmit={requestReset} className="space-y-5" noValidate>
                    <div className="mb-6 flex justify-center">
                        <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full border border-gold-400/30 bg-[radial-gradient(circle,rgba(255,184,0,.15),rgba(255,184,0,.025)_65%,transparent)] shadow-[0_0_35px_rgba(255,184,0,.08)]">
                            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-gold-400/20 bg-gold-400/[0.06]"><KeyRound size={31} strokeWidth={1.7} className="text-gold-300" /></div>
                            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/30 bg-[#080a12]"><ShieldCheck size={17} className="text-gold-400" /></span>
                        </div>
                    </div>
                    <Field label="Email Address" icon={<Mail size={19} />}>
                        <input type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setError("") }} placeholder="you@example.com" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25" />
                    </Field>
                    <button type="submit" disabled={loading} className="flex h-[56px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-sm font-black text-[#171006] shadow-[0_0_28px_rgba(255,184,0,.18)] transition hover:scale-[1.01] disabled:opacity-60">
                        {loading ? "SENDING CODE..." : "SEND RESET CODE"}
                    </button>
                    <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-semibold text-white/40 transition hover:text-gold-300"><ArrowLeft size={15} />Back to Sign In</Link>
                </form>
            )}

            {step === "reset" && (
                <form onSubmit={resetPassword} className="space-y-5" noValidate>
                    <Field label="6-Digit Reset Code" icon={<KeyRound size={19} />}>
                        <input inputMode="numeric" maxLength={6} value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError("") }} placeholder="000000" className="h-full w-full bg-transparent px-3 text-sm tracking-[0.35em] text-white outline-none placeholder:text-white/20" />
                    </Field>
                    <Field label="New Password" icon={<LockKeyhole size={19} />}>
                        <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError("") }} placeholder="Create a new password" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25" />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="text-white/35 hover:text-gold-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </Field>
                    <Field label="Confirm New Password" icon={<LockKeyhole size={19} />}>
                        <input type={showConfirm ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError("") }} placeholder="Repeat your new password" className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25" />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-white/35 hover:text-gold-300">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </Field>
                    <button type="submit" disabled={loading} className="flex h-[56px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-sm font-black text-[#171006] transition hover:scale-[1.01] disabled:opacity-60">{loading ? "RESETTING..." : "RESET PASSWORD"}</button>
                    <button type="button" onClick={resend} disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gold-400/25 bg-gold-400/[0.035] text-xs font-black text-gold-300 disabled:opacity-50"><RotateCcw size={15} />RESEND CODE</button>
                    <button type="button" onClick={() => { setStep("request"); setCode(""); setNewPassword(""); setConfirmPassword(""); setError(""); setMessage("") }} className="w-full text-center text-xs text-white/40 hover:text-gold-300">Use a different email address</button>
                </form>
            )}

            {step === "success" && (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center"><div className="flex h-[112px] w-[112px] items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.05]"><CheckCircle2 size={48} className="text-emerald-300" /></div></div>
                    <p className="text-sm leading-6 text-white/45">Your new password is active. Use it the next time you sign in to GoldenSweep.</p>
                    <button type="button" onClick={() => navigate("/login")} className="flex h-[54px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-sm font-black text-black">BACK TO SIGN IN</button>
                </div>
            )}
        </AuthLayout>
    )
}

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div>
        <label className="text-xs font-black uppercase tracking-[0.12em] text-white/60">{label}</label>
        <div className="mt-2 flex h-[54px] items-center rounded-xl border border-white/[0.09] bg-black/25 px-4 text-gold-400 transition focus-within:border-gold-400/45">{icon}{children}</div>
    </div>
)

export default ForgotPasswordPage
