import {
    CalendarDays,
    Camera,
    ChevronDown,
    Eye,
    EyeOff,
    Globe2,
    LockKeyhole,
    Mail,
    Phone,
    ShieldCheck,
    User,
} from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../../components/auth/AuthLayout"
import { ApiError } from "../../services/api"
import { authService } from "../../services/authService"

interface FormErrors {
    fullName?: string
    email?: string
    phone?: string
    dob?: string
    country?: string
    state?: string
    language?: string
    password?: string
    confirmPassword?: string
    terms?: string
    age?: string
    general?: string
}

const SignupPage = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [avatar, setAvatar] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [dob, setDob] = useState("")
    const [country, setCountry] = useState("United States")
    const [state, setState] = useState("")
    const [language, setLanguage] = useState("English")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [ageConfirmed, setAgeConfirmed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})

    const passwordStrength = useMemo(() => {
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 1) return { label: "Weak", width: "20%" }
        if (score === 2) return { label: "Fair", width: "40%" }
        if (score === 3) return { label: "Good", width: "60%" }
        if (score === 4) return { label: "Strong", width: "80%" }
        return { label: "Excellent", width: "100%" }
    }, [password])

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            setErrors(current => ({ ...current, general: "Please choose a valid image file." }))
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors(current => ({ ...current, general: "Profile image must be smaller than 5 MB." }))
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") setAvatar(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const validate = () => {
        const nextErrors: FormErrors = {}
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!fullName.trim()) nextErrors.fullName = "Full name is required."
        if (!email.trim()) nextErrors.email = "Email is required."
        else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email address."
        if (!phone.trim()) nextErrors.phone = "Phone number is required."
        if (!dob) nextErrors.dob = "Date of birth is required."
        if (!country) nextErrors.country = "Country is required."
        if (!state.trim()) nextErrors.state = "State is required."
        if (!language) nextErrors.language = "Preferred language is required."
        if (!password) nextErrors.password = "Password is required."
        else if (password.length < 8) nextErrors.password = "Password must contain at least 8 characters."
        if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password."
        else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match."
        if (!ageConfirmed) nextErrors.age = "You must confirm that you are at least 18 years old."
        if (!acceptedTerms) nextErrors.terms = "You must accept the Terms and Privacy Policy."

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!validate()) return
        setLoading(true)
        setErrors({})

        try {
            const response = await authService.register({
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                date_of_birth: dob,
                country,
                state: state.trim(),
                preferred_language: language,
                password,
                age_confirmed: ageConfirmed,
                terms_accepted: acceptedTerms,
            })

            localStorage.setItem("goldensweep_pending_verification_email", response.data.email)
            navigate("/verify-email")
        } catch (error) {
            setErrors({ general: error instanceof ApiError ? error.message : "Unable to create your account right now. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            mode="signup"
            eyebrow="JOIN THE GOLDEN WORLD"
            title="Create your GoldenSweep account"
            description="Set up your player profile and unlock your wallet, supported gaming worlds, credits and recharge experience."
            footerText="Already have an account?"
            footerLinkText="Sign in"
            footerLinkTo="/login"
        >
            <form onSubmit={handleSubmit} noValidate>
                {errors.general && (
                    <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/[0.07] px-4 py-3 text-sm text-red-200">
                        {errors.general}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[165px_1fr]">
                    <div className="flex flex-col items-center xl:border-r xl:border-white/[0.07] xl:pr-6">
                        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gold-400">
                            Profile
                        </p>

                        <div className="relative">
                            <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-full border-2 border-gold-400/35 bg-[radial-gradient(circle,rgba(255,184,0,.13),rgba(255,184,0,.025))] shadow-[0_0_35px_rgba(255,184,0,.12)]">
                                {avatar ? (
                                    <img src={avatar} alt="Profile preview" className="h-full w-full object-cover" />
                                ) : (
                                    <User size={44} className="text-gold-400/75" />
                                )}
                            </div>

                            <button
                                type="button"
                                aria-label="Upload profile photo"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/35 bg-[#0b0d16] text-gold-300 shadow-lg transition hover:scale-105 hover:bg-gold-400 hover:text-black"
                            >
                                <Camera size={18} />
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        <p className="mt-4 text-center text-xs leading-5 text-white/35">
                            Add your player avatar
                            <br />
                            PNG or JPG • Max 5 MB
                        </p>

                        <div className="mt-6 hidden w-full rounded-xl border border-gold-400/10 bg-gold-400/[0.025] p-3 text-center xl:block">
                            <ShieldCheck size={17} className="mx-auto text-gold-400" />
                            <p className="mt-2 text-[10px] leading-4 text-white/35">
                                Your account information is protected.
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="grid gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                            <Field label="Full Name" error={errors.fullName}>
                                <User size={17} className="shrink-0 text-gold-400/80" />
                                <input
                                    value={fullName}
                                    onChange={event => setFullName(event.target.value)}
                                    placeholder="Your full name"
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-white outline-none placeholder:text-white/25"
                                />
                            </Field>

                            <Field label="Email Address" error={errors.email}>
                                <Mail size={17} className="shrink-0 text-gold-400/80" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={event => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-white outline-none placeholder:text-white/25"
                                />
                            </Field>

                            <Field label="Phone Number" error={errors.phone}>
                                <Phone size={17} className="shrink-0 text-gold-400/80" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={event => setPhone(event.target.value)}
                                    placeholder="+1 555 000 0000"
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-white outline-none placeholder:text-white/25"
                                />
                            </Field>

                            <Field label="Date of Birth" error={errors.dob}>
                                <CalendarDays size={17} className="shrink-0 text-gold-400/80" />
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={event => setDob(event.target.value)}
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-white outline-none [color-scheme:dark]"
                                />
                            </Field>

                            <Field label="Country" error={errors.country}>
                                <Globe2 size={17} className="shrink-0 text-gold-400/80" />
                                <select
                                    value={country}
                                    onChange={event => setCountry(event.target.value)}
                                    className="h-full min-w-0 flex-1 appearance-none bg-transparent px-2.5 text-sm text-white outline-none"
                                >
                                    <option className="bg-[#0b0d16]">United States</option>
                                    <option className="bg-[#0b0d16]">Canada</option>
                                    <option className="bg-[#0b0d16]">Other</option>
                                </select>
                                <ChevronDown size={15} className="text-white/30" />
                            </Field>

                            <Field label="State" error={errors.state}>
                                <input
                                    value={state}
                                    onChange={event => setState(event.target.value)}
                                    placeholder="Enter your state"
                                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                                />
                            </Field>

                            <Field label="Preferred Language" error={errors.language}>
                                <Globe2 size={17} className="shrink-0 text-gold-400/80" />
                                <select
                                    value={language}
                                    onChange={event => setLanguage(event.target.value)}
                                    className="h-full min-w-0 flex-1 appearance-none bg-transparent px-2.5 text-sm text-white outline-none"
                                >
                                    <option className="bg-[#0b0d16]">English</option>
                                    <option className="bg-[#0b0d16]">Spanish</option>
                                </select>
                                <ChevronDown size={15} className="text-white/30" />
                            </Field>

                            <div>
                                <Field label="Password" error={errors.password}>
                                    <LockKeyhole size={17} className="shrink-0 text-gold-400/80" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={event => setPassword(event.target.value)}
                                        placeholder="Secure password"
                                        className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-white outline-none placeholder:text-white/25"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(current => !current)}
                                        className="text-white/35 transition hover:text-gold-300"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </Field>

                                {password && (
                                    <div className="mt-2">
                                        <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
                                            <div
                                                style={{ width: passwordStrength.width }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#b67810] via-[#ffc83d] to-[#f5dc78] transition-all"
                                            />
                                        </div>

                                        <div className="mt-1 flex justify-between text-[9px]">
                                            <span className="text-white/25">8+ chars, number & symbol</span>
                                            <span className="font-bold text-gold-300">{passwordStrength.label}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Field label="Confirm Password" error={errors.confirmPassword}>
                                <LockKeyhole size={17} className="shrink-0 text-gold-400/80" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={event => setConfirmPassword(event.target.value)}
                                    placeholder="Repeat password"
                                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-white outline-none placeholder:text-white/25"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(current => !current)}
                                    className="text-white/35 transition hover:text-gold-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </Field>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-2">
                            <ConsentRow checked={ageConfirmed} onChange={setAgeConfirmed} error={errors.age}>
                                I confirm that I am at least 18 years old.
                            </ConsentRow>

                            <ConsentRow checked={acceptedTerms} onChange={setAcceptedTerms} error={errors.terms}>
                                I agree to the{" "}
                                <Link to="/terms" className="font-bold text-gold-300 hover:text-gold-200">
                                    Terms
                                </Link>{" "}
                                and{" "}
                                <Link to="/privacy" className="font-bold text-gold-300 hover:text-gold-200">
                                    Privacy Policy
                                </Link>.
                            </ConsentRow>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative flex h-[50px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-sm font-black text-[#171006] shadow-[0_0_28px_rgba(255,184,0,.2)] transition hover:scale-[1.005] hover:shadow-[0_0_38px_rgba(255,184,0,.3)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                                        CREATING ACCOUNT...
                                    </span>
                                ) : (
                                    "CREATE GOLDENSWEEP ACCOUNT"
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[10px] text-white/35 sm:w-[220px]">
                                <ShieldCheck size={15} className="shrink-0 text-gold-400" />
                                Secure account creation
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthLayout>
    )
}

const Field = ({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: React.ReactNode
}) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-[0.11em] text-white/55">
            {label}
        </label>

        <div
            className={`mt-1.5 flex h-[48px] items-center rounded-xl border bg-black/25 px-3 transition ${error
                ? "border-red-400/50"
                : "border-white/[0.09] focus-within:border-gold-400/45"
                }`}
        >
            {children}
        </div>

        {error && (
            <p className="mt-1 text-[9px] leading-3 text-red-300">
                {error}
            </p>
        )}
    </div>
)

const ConsentRow = ({
    checked,
    onChange,
    children,
    error,
}: {
    checked: boolean
    onChange: (value: boolean) => void
    children: React.ReactNode
    error?: string
}) => (
    <div>
        <label
            className={`flex min-h-[54px] cursor-pointer items-center gap-3 rounded-xl border p-3 ${error
                ? "border-red-400/35 bg-red-500/[0.03]"
                : "border-white/[0.07] bg-white/[0.02]"
                }`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={event => onChange(event.target.checked)}
                className="h-4 w-4 shrink-0 accent-[#e5ae2d]"
            />

            <span className="text-[11px] leading-5 text-white/45">
                {children}
            </span>
        </label>

        {error && (
            <p className="mt-1 text-[9px] text-red-300">
                {error}
            </p>
        )}
    </div>
)

export default SignupPage