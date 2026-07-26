import {
    CalendarDays,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    Clock3,
    Edit3,
    Globe2,
    KeyRound,
    Eye,
    EyeOff,
    Languages,
    LockKeyhole,
    LogOut,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    Trash2,
    User,
    WalletCards,
    X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/layout/Navbar"
import { ApiError } from "../../services/api"
import { authService } from "../../services/authService"
import { clearAuth } from "../../services/authStorage"
import { userService } from "../../services/userService"

interface Profile {
    id?: string
    fullName: string
    email: string
    phone: string
    dob: string
    country: string
    state: string
    language: string
    avatar: string
    verified: boolean
    createdAt?: string
}

const emptyProfile: Profile = {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    country: "United States",
    state: "",
    language: "English",
    avatar: "",
    verified: false,
}

const ProfilePage = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState<Profile>(emptyProfile)
    const [draft, setDraft] = useState<Profile>(emptyProfile)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState("")

    useEffect(() => {
        let active = true
        const loadProfile = async () => {
            try {
                const response = await userService.getMe()
                if (!active) return
                const data = response.data
                const normalized: Profile = {
                    id: data.id,
                    fullName: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    dob: data.date_of_birth || "",
                    country: data.country || "",
                    state: data.state || "",
                    language: data.preferred_language || "English",
                    avatar: data.avatar_url || "",
                    verified: data.email_verified,
                    createdAt: data.created_at,
                }
                setProfile(normalized)
                setDraft(normalized)
            } catch (error) {
                if (!active) return
                if (error instanceof ApiError && error.status === 401) {
                    clearAuth()
                    navigate("/login", { replace: true })
                    return
                }
                setError(error instanceof ApiError ? error.message : "We could not load your profile information.")
            } finally {
                if (active) setLoadingProfile(false)
            }
        }
        void loadProfile()
        return () => { active = false }
    }, [navigate])

    const initials = useMemo(() => {
        if (!profile.fullName.trim()) return "GS"

        return profile.fullName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("")
    }, [profile.fullName])

    const completion = useMemo(() => {
        const values = [
            profile.fullName,
            profile.email,
            profile.phone,
            profile.dob,
            profile.country,
            profile.state,
            profile.language,
            profile.avatar,
        ]

        return Math.round(
            (values.filter(value => Boolean(value?.trim())).length /
                values.length) *
                100
        )
    }, [profile])

    const memberSince = useMemo(() => {
        if (!profile.createdAt) return "New member"

        const date = new Date(profile.createdAt)

        if (Number.isNaN(date.getTime())) return "New member"

        return date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        })
    }, [profile.createdAt])

    const handleAvatar = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]

        if (!file) return

        if (!file.type.startsWith("image/")) {
            setError("Please choose a valid image file.")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Profile image must be smaller than 5 MB.")
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            if (typeof reader.result !== "string") return

            const updated = {
                ...profile,
                avatar: reader.result,
            }

            setProfile(updated)
            setDraft(updated)
            localStorage.setItem(
                "goldensweep_profile",
                JSON.stringify(updated)
            )

            setMessage("Profile photo updated.")
            setError("")
        }

        reader.readAsDataURL(file)

        event.target.value = ""
    }

    const removeAvatar = () => {
        const updated = {
            ...profile,
            avatar: "",
        }

        setProfile(updated)
        setDraft(updated)

        localStorage.setItem(
            "goldensweep_profile",
            JSON.stringify(updated)
        )

        setMessage("Profile photo removed.")
    }

    const startEditing = () => {
        setDraft(profile)
        setEditing(true)
        setMessage("")
        setError("")
    }

    const cancelEditing = () => {
        setDraft(profile)
        setEditing(false)
        setError("")
    }

    const saveProfile = async () => {
        if (!draft.fullName.trim()) {
            setError("Full name is required.")
            return
        }

        if (!draft.email.trim()) {
            setError("Email address is required.")
            return
        }

        setSaving(true)
        setError("")
        setMessage("")

        try {
            await new Promise(resolve =>
                window.setTimeout(resolve, 650)
            )

            const updated = {
                ...draft,
                fullName: draft.fullName.trim(),
                email: draft.email.trim(),
                phone: draft.phone.trim(),
                state: draft.state.trim(),
            }

            localStorage.setItem(
                "goldensweep_profile",
                JSON.stringify(updated)
            )

            setProfile(updated)
            setDraft(updated)
            setEditing(false)
            setMessage("Your profile has been updated successfully.")
        } catch {
            setError("Unable to save your profile right now.")
        } finally {
            setSaving(false)
        }
    }

    const closePasswordModal = () => {
        setPasswordModalOpen(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setPasswordError("")
        setShowCurrentPassword(false)
        setShowNewPassword(false)
    }

    const changePassword = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setPasswordError("")
        setMessage("")

        if (!currentPassword) return setPasswordError("Current password is required.")
        if (newPassword.length < 8) return setPasswordError("New password must contain at least 8 characters.")
        if (newPassword !== confirmPassword) return setPasswordError("New passwords do not match.")
        if (currentPassword === newPassword) return setPasswordError("New password must be different from your current password.")

        setChangingPassword(true)
        try {
            await userService.changePassword(currentPassword, newPassword)
            closePasswordModal()
            setMessage("Password changed successfully.")
        } catch (error) {
            setPasswordError(error instanceof ApiError ? error.message : "Unable to change your password right now.")
        } finally {
            setChangingPassword(false)
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch {
            // Local logout still proceeds.
        } finally {
            clearAuth()
            navigate("/login")
        }
    }

    return (
        <div className="min-h-screen bg-[#02030a] text-white">
            <Navbar />

            <main className="relative min-h-screen overflow-hidden pb-14 pt-[104px]">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,184,0,.07),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(108,40,190,.08),transparent_32%)]" />

                <div className="pointer-events-none fixed inset-x-0 top-[80px] h-[300px] bg-[linear-gradient(180deg,rgba(255,184,0,.025),transparent)]" />

                <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-10">
                    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ffc83d]">
                                MY GOLDENSWEEP
                            </p>

                            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
                                Account Center
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                                Manage your profile, account security,
                                verification status and GoldenSweep experience
                                from one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {!editing ? (
                                <button
                                    type="button"
                                    onClick={startEditing}
                                    className="flex h-11 items-center gap-2 rounded-xl border border-gold-400/30 bg-gold-400/[0.04] px-5 text-xs font-black text-gold-300 transition hover:border-gold-300/60 hover:bg-gold-400/[0.08]"
                                >
                                    <Edit3 size={16} />
                                    EDIT PROFILE
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 text-xs font-bold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <X size={16} />
                                        CANCEL
                                    </button>

                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={saveProfile}
                                        className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] px-6 text-xs font-black text-black shadow-[0_0_25px_rgba(255,184,0,.16)] transition hover:scale-[1.02] disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                                        ) : (
                                            <Save size={16} />
                                        )}

                                        {saving ? "SAVING..." : "SAVE CHANGES"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] px-4 py-3 text-sm text-emerald-200">
                            <CheckCircle2 size={18} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
                        <aside className="space-y-6">
                            <section className="relative overflow-hidden rounded-[26px] border border-[#d4a32c]/25 bg-[linear-gradient(145deg,rgba(9,10,19,.96),rgba(14,8,27,.94))] p-6 shadow-[0_25px_80px_rgba(0,0,0,.38)]">
                                <div className="pointer-events-none absolute left-1/2 top-[-100px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-gold-400/[0.08] blur-[85px]" />

                                <div className="relative flex flex-col items-center text-center">
                                    <div className="relative">
                                        <div className="flex h-[138px] w-[138px] items-center justify-center overflow-hidden rounded-full border-2 border-gold-400/35 bg-[radial-gradient(circle,rgba(255,184,0,.16),rgba(255,184,0,.025))] text-3xl font-black text-gold-300 shadow-[0_0_42px_rgba(255,184,0,.13)]">
                                            {profile.avatar ? (
                                                <img
                                                    src={profile.avatar}
                                                    alt={profile.fullName || "Profile"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                initials
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="absolute bottom-1 right-0 flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/35 bg-[#090b14] text-gold-300 shadow-xl transition hover:scale-105 hover:bg-gold-400 hover:text-black"
                                        >
                                            <Camera size={18} />
                                        </button>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatar}
                                            className="hidden"
                                        />
                                    </div>

                                    <h2 className="mt-5 text-xl font-black text-white">
                                        {profile.fullName || "GoldenSweep Player"}
                                    </h2>

                                    <p className="mt-1 max-w-full truncate text-xs text-white/40">
                                        {profile.email || "Complete your profile"}
                                    </p>

                                    <div className="mt-4 flex items-center gap-2 rounded-full border border-gold-400/15 bg-gold-400/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-gold-300">
                                        <ShieldCheck size={13} />
                                        Player Account
                                    </div>

                                    <div className="mt-6 w-full">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold uppercase tracking-wider text-white/35">
                                                Profile completion
                                            </span>

                                            <span className="font-black text-gold-300">
                                                {completion}%
                                            </span>
                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                            <div
                                                style={{
                                                    width: `${completion}%`,
                                                }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#b77c12] via-[#ffc83d] to-[#ffe17a] transition-all duration-500"
                                            />
                                        </div>
                                    </div>

                                    {profile.avatar && (
                                        <button
                                            type="button"
                                            onClick={removeAvatar}
                                            className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-white/30 transition hover:text-red-300"
                                        >
                                            <Trash2 size={13} />
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                                    Account Status
                                </p>

                                <div className="mt-4 space-y-3">
                                    <StatusRow
                                        icon={<Mail size={16} />}
                                        label="Email"
                                        status={
                                            profile.verified
                                                ? "Verified"
                                                : "Pending"
                                        }
                                        verified={profile.verified}
                                    />

                                    <StatusRow
                                        icon={<Phone size={16} />}
                                        label="Phone"
                                        status="Pending"
                                        verified={false}
                                    />

                                    <StatusRow
                                        icon={<ShieldCheck size={16} />}
                                        label="Account"
                                        status="Active"
                                        verified
                                    />
                                </div>
                            </section>
                        </aside>

                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <SummaryCard
                                    icon={<WalletCards size={22} />}
                                    label="Available Balance"
                                    value={loadingProfile ? "..." : "0 GC"}
                                    note="Golden Credits"
                                />

                                <SummaryCard
                                    icon={<CircleDollarSign size={22} />}
                                    label="Recharge Activity"
                                    value="0"
                                    note="Requests completed"
                                />

                                <SummaryCard
                                    icon={<Clock3 size={22} />}
                                    label="Member Since"
                                    value={memberSince}
                                    note="GoldenSweep member"
                                />
                            </div>

                            <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(8,9,17,.95),rgba(9,7,18,.94))]">
                                <SectionHeader
                                    icon={<User size={19} />}
                                    eyebrow="PERSONAL DETAILS"
                                    title="Your information"
                                    description={
                                        editing
                                            ? "Update your account information below."
                                            : "Personal information associated with your GoldenSweep account."
                                    }
                                />

                                <div className="grid gap-5 border-t border-white/[0.06] p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
                                    <ProfileField
                                        label="Full Name"
                                        icon={<User size={17} />}
                                        editing={editing}
                                        value={editing ? draft.fullName : profile.fullName}
                                        placeholder="Not provided"
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                fullName: value,
                                            }))
                                        }
                                    />

                                    <ProfileField
                                        label="Email Address"
                                        icon={<Mail size={17} />}
                                        editing={editing}
                                        type="email"
                                        value={editing ? draft.email : profile.email}
                                        placeholder="Not provided"
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                email: value,
                                            }))
                                        }
                                    />

                                    <ProfileField
                                        label="Phone Number"
                                        icon={<Phone size={17} />}
                                        editing={editing}
                                        type="tel"
                                        value={editing ? draft.phone : profile.phone}
                                        placeholder="Not provided"
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                phone: value,
                                            }))
                                        }
                                    />

                                    <ProfileField
                                        label="Date of Birth"
                                        icon={<CalendarDays size={17} />}
                                        editing={editing}
                                        type="date"
                                        value={editing ? draft.dob : profile.dob}
                                        placeholder="Not provided"
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                dob: value,
                                            }))
                                        }
                                    />

                                    <SelectProfileField
                                        label="Country"
                                        icon={<Globe2 size={17} />}
                                        editing={editing}
                                        value={editing ? draft.country : profile.country}
                                        options={[
                                            "United States",
                                            "Canada",
                                            "Other",
                                        ]}
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                country: value,
                                            }))
                                        }
                                    />

                                    <ProfileField
                                        label="State"
                                        icon={<MapPin size={17} />}
                                        editing={editing}
                                        value={editing ? draft.state : profile.state}
                                        placeholder="Not provided"
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                state: value,
                                            }))
                                        }
                                    />

                                    <SelectProfileField
                                        label="Preferred Language"
                                        icon={<Languages size={17} />}
                                        editing={editing}
                                        value={editing ? draft.language : profile.language}
                                        options={[
                                            "English",
                                            "Spanish",
                                        ]}
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                language: value,
                                            }))
                                        }
                                    />
                                </div>
                            </section>

                            <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(8,9,17,.95),rgba(9,7,18,.94))]">
                                <SectionHeader
                                    icon={<LockKeyhole size={19} />}
                                    eyebrow="SECURITY"
                                    title="Account & security"
                                    description="Manage access, verification and security settings for your account."
                                />

                                <div className="grid gap-4 border-t border-white/[0.06] p-5 sm:p-6 lg:grid-cols-2">
                                    <SecurityCard
                                        icon={<KeyRound size={20} />}
                                        title="Password"
                                        text="Keep your password strong and unique to protect your GoldenSweep account."
                                        action="CHANGE PASSWORD"
                                        onClick={() => {
                                            setPasswordModalOpen(true)
                                            setPasswordError("")
                                            setMessage("")
                                        }}
                                    />

                                    <SecurityCard
                                        icon={<Mail size={20} />}
                                        title="Email verification"
                                        text={
                                            profile.verified
                                                ? "Your email address is verified and connected to this account."
                                                : "Verify your email to strengthen account security and recovery."
                                        }
                                        action={
                                            profile.verified
                                                ? "VERIFIED"
                                                : "VERIFY EMAIL"
                                        }
                                        completed={profile.verified}
                                        onClick={() => {
                                            if (!profile.verified) {
                                                navigate("/verify-email")
                                            }
                                        }}
                                    />
                                </div>
                            </section>

                            <section className="flex flex-col gap-4 rounded-[22px] border border-red-400/10 bg-red-500/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.15em] text-white/65">
                                        Sign out of GoldenSweep
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/35">
                                        End your current session on this device.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.04] px-5 text-xs font-black text-red-200 transition hover:border-red-400/40 hover:bg-red-500/[0.09]"
                                >
                                    <LogOut size={16} />
                                    LOG OUT
                                </button>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {passwordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) closePasswordModal() }}>
                    <div className="relative w-full max-w-[520px] overflow-hidden rounded-[26px] border border-gold-400/20 bg-[linear-gradient(145deg,#090b14,#0b0715)] p-6 shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:p-7">
                        <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-gold-400/[0.05] blur-3xl" />
                        <button type="button" onClick={closePasswordModal} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:border-gold-400/30 hover:text-white"><X size={17} /></button>

                        <div className="relative">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/[0.05] text-gold-300"><KeyRound size={20} /></div>
                            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-gold-400">ACCOUNT SECURITY</p>
                            <h2 className="mt-1 text-2xl font-black text-white">Change your password</h2>
                            <p className="mt-2 text-xs leading-5 text-white/40">Enter your current password, then create a strong new password for your GoldenSweep account.</p>

                            {passwordError && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">{passwordError}</div>}

                            <form onSubmit={changePassword} className="mt-6 space-y-4">
                                <PasswordField label="Current Password" value={currentPassword} onChange={value => { setCurrentPassword(value); setPasswordError("") }} visible={showCurrentPassword} onToggle={() => setShowCurrentPassword(value => !value)} placeholder="Enter current password" />
                                <PasswordField label="New Password" value={newPassword} onChange={value => { setNewPassword(value); setPasswordError("") }} visible={showNewPassword} onToggle={() => setShowNewPassword(value => !value)} placeholder="Create new password" />
                                <PasswordField label="Confirm New Password" value={confirmPassword} onChange={value => { setConfirmPassword(value); setPasswordError("") }} visible={showNewPassword} onToggle={() => setShowNewPassword(value => !value)} placeholder="Repeat new password" />

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={closePasswordModal} className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/10 text-xs font-black text-white/55 transition hover:bg-white/[0.04] hover:text-white">CANCEL</button>
                                    <button type="submit" disabled={changingPassword} className="flex h-12 flex-[1.35] items-center justify-center rounded-xl bg-gradient-to-r from-[#d79417] via-[#ffd45d] to-[#dc9715] text-xs font-black text-black shadow-[0_0_26px_rgba(255,184,0,.16)] transition hover:scale-[1.01] disabled:opacity-60">{changingPassword ? "UPDATING..." : "UPDATE PASSWORD"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const SectionHeader = ({
    icon,
    eyebrow,
    title,
    description,
}: {
    icon: React.ReactNode
    eyebrow: string
    title: string
    description: string
}) => (
    <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/[0.05] text-gold-300">
            {icon}
        </div>

        <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-400">
                {eyebrow}
            </p>

            <h2 className="mt-1 text-lg font-black text-white">
                {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-white/35">
                {description}
            </p>
        </div>
    </div>
)

const ProfileField = ({
    label,
    icon,
    editing,
    value,
    placeholder,
    type = "text",
    onChange,
}: {
    label: string
    icon: React.ReactNode
    editing: boolean
    value: string
    placeholder: string
    type?: string
    onChange: (value: string) => void
}) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
            {label}
        </p>

        {editing ? (
            <div className="mt-2 flex h-[49px] items-center rounded-xl border border-white/[0.09] bg-black/25 px-3 text-gold-400 transition focus-within:border-gold-400/45">
                {icon}

                <input
                    type={type}
                    value={value}
                    onChange={event => onChange(event.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none [color-scheme:dark]"
                />
            </div>
        ) : (
            <div className="mt-2 flex min-h-[49px] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4">
                <span className="text-gold-400/70">
                    {icon}
                </span>

                <span
                    className={
                        value
                            ? "truncate text-sm font-semibold text-white/75"
                            : "text-sm text-white/25"
                    }
                >
                    {value || placeholder}
                </span>
            </div>
        )}
    </div>
)

const SelectProfileField = ({
    label,
    icon,
    editing,
    value,
    options,
    onChange,
}: {
    label: string
    icon: React.ReactNode
    editing: boolean
    value: string
    options: string[]
    onChange: (value: string) => void
}) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
            {label}
        </p>

        {editing ? (
            <div className="mt-2 flex h-[49px] items-center rounded-xl border border-white/[0.09] bg-black/25 px-3 text-gold-400 transition focus-within:border-gold-400/45">
                {icon}

                <select
                    value={value}
                    onChange={event => onChange(event.target.value)}
                    className="h-full min-w-0 flex-1 appearance-none bg-transparent px-3 text-sm text-white outline-none"
                >
                    {options.map(option => (
                        <option
                            key={option}
                            value={option}
                            className="bg-[#0b0d16]"
                        >
                            {option}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    className="text-white/30"
                />
            </div>
        ) : (
            <div className="mt-2 flex min-h-[49px] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4">
                <span className="text-gold-400/70">
                    {icon}
                </span>

                <span className="text-sm font-semibold text-white/75">
                    {value || "Not provided"}
                </span>
            </div>
        )}
    </div>
)

const StatusRow = ({
    icon,
    label,
    status,
    verified,
}: {
    icon: React.ReactNode
    label: string
    status: string
    verified: boolean
}) => (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3">
        <div className="flex items-center gap-2.5">
            <span className="text-gold-400/70">
                {icon}
            </span>

            <span className="text-xs font-semibold text-white/55">
                {label}
            </span>
        </div>

        <span
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                verified
                    ? "text-emerald-300"
                    : "text-amber-300/70"
            }`}
        >
            {verified && <Check size={12} />}
            {status}
        </span>
    </div>
)

const SummaryCard = ({
    icon,
    label,
    value,
    note,
}: {
    icon: React.ReactNode
    label: string
    value: string
    note: string
}) => (
    <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(10,11,20,.96),rgba(8,7,17,.94))] p-5">
        <div className="absolute right-[-40px] top-[-45px] h-28 w-28 rounded-full bg-gold-400/[0.035] blur-3xl" />

        <div className="relative flex items-start justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/35">
                    {label}
                </p>

                <p className="mt-3 text-2xl font-black text-white">
                    {value}
                </p>

                <p className="mt-1 text-[10px] text-white/30">
                    {note}
                </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-400/15 bg-gold-400/[0.045] text-gold-300">
                {icon}
            </div>
        </div>
    </div>
)

const SecurityCard = ({
    icon,
    title,
    text,
    action,
    completed = false,
    onClick,
}: {
    icon: React.ReactNode
    title: string
    text: string
    action: string
    completed?: boolean
    onClick: () => void
}) => (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-400/15 bg-gold-400/[0.04] text-gold-300">
            {icon}
        </div>

        <h3 className="mt-4 text-sm font-black text-white">
            {title}
        </h3>

        <p className="mt-2 min-h-[40px] text-xs leading-5 text-white/35">
            {text}
        </p>

        <button
            type="button"
            disabled={completed}
            onClick={onClick}
            className={`mt-4 flex h-9 items-center gap-2 rounded-lg px-4 text-[10px] font-black transition ${
                completed
                    ? "cursor-default border border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300"
                    : "border border-gold-400/20 bg-gold-400/[0.035] text-gold-300 hover:border-gold-400/45"
            }`}
        >
            {completed && <CheckCircle2 size={13} />}
            {action}
        </button>
    </div>
)


const PasswordField = ({ label, value, onChange, visible, onToggle, placeholder }: {
    label: string
    value: string
    onChange: (value: string) => void
    visible: boolean
    onToggle: () => void
    placeholder: string
}) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">{label}</label>
        <div className="mt-2 flex h-[52px] items-center rounded-xl border border-white/[0.09] bg-black/25 px-4 transition focus-within:border-gold-400/45">
            <LockKeyhole size={17} className="shrink-0 text-gold-400/75" />
            <input type={visible ? "text" : "password"} value={value} onChange={event => onChange(event.target.value)} autoComplete="new-password" placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/25" />
            <button type="button" onClick={onToggle} className="text-white/30 transition hover:text-gold-300">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
        </div>
    </div>
)

export default ProfilePage