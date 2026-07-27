import {
    ChevronDown,
    CircleDollarSign,
    LayoutDashboard,
    LogOut,
    Menu,
    User,
    WalletCards,
    X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import logoHorizontal from "../../assets/branding/logo_horizontal.png"
import { navigationItems } from "../../config/navigation"
import { clearAuth, getAuthUser, isAuthenticated } from "../../services/authStorage"
import { authService } from "../../services/authService"

const NAVBAR_HEIGHT = 80
const SCROLL_GAP = 28
const SCROLL_OFFSET = NAVBAR_HEIGHT + SCROLL_GAP

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("home")
    const [profile, setProfile] = useState(getAuthUser())
    const [authenticated, setAuthenticated] = useState(isAuthenticated())
    const profileMenuRef = useRef<HTMLDivElement>(null)

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const syncAuth = () => {
            setProfile(getAuthUser())
            setAuthenticated(isAuthenticated())
        }

        syncAuth()

        window.addEventListener("storage", syncAuth)
        window.addEventListener("goldensweep-auth-change", syncAuth)

        return () => {
            window.removeEventListener("storage", syncAuth)
            window.removeEventListener("goldensweep-auth-change", syncAuth)
        }
    }, [location.pathname])

    useEffect(() => {
        const handleOutside = (event: globalThis.MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setProfileOpen(false)
            }
        }

        document.addEventListener("mousedown", handleOutside)

        return () => {
            document.removeEventListener("mousedown", handleOutside)
        }
    }, [])

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (!element) return

        const top =
            element.getBoundingClientRect().top +
            window.scrollY -
            SCROLL_OFFSET

        window.scrollTo({
            top: Math.max(0, top),
            behavior: "smooth",
        })
    }

    const handleSectionClick = (
        event: MouseEvent<HTMLAnchorElement>,
        href: string
    ) => {
        event.preventDefault()
        setMenuOpen(false)

        const sectionId = href.replace("#", "")

        if (location.pathname !== "/") {
            navigate(`/${href}`)
            return
        }

        window.history.replaceState(null, "", href)
        scrollToSection(sectionId)
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch {
        } finally {
            clearAuth()
            setAuthenticated(false)
            setProfile(null)
            setProfileOpen(false)
            setMenuOpen(false)
            navigate("/login")
        }
    }

    useEffect(() => {
        if (location.pathname !== "/") {
            setActiveSection("")
            return
        }

        const handleScroll = () => {
            const sections = navigationItems
                .map(item => item.href.replace("#", ""))
                .map(id => document.getElementById(id))
                .filter(Boolean) as HTMLElement[]

            let current = "home"
            const position =
                window.scrollY +
                SCROLL_OFFSET +
                10

            for (const section of sections) {
                if (position >= section.offsetTop) {
                    current = section.id
                }
            }

            setActiveSection(current)
        }

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        })

        handleScroll()

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            )
    }, [location.pathname])

    useEffect(() => {
        if (
            location.pathname !== "/" ||
            !location.hash
        ) {
            return
        }

        const sectionId =
            location.hash.replace("#", "")

        const timer =
            window.setTimeout(() => {
                scrollToSection(sectionId)
            }, 100)

        return () =>
            window.clearTimeout(timer)
    }, [
        location.pathname,
        location.hash,
    ])

    const initials =
        profile?.full_name
            ?.trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "GS"

    const normalizedRole =
        profile?.role?.trim().toLowerCase() || ""

    const isAdministrator =
        normalizedRole === "admin" ||
        normalizedRole === "super_admin"

    const accountDestination =
        isAdministrator
            ? "/admin"
            : "/profile"
    const accountLabel =
        normalizedRole === "super_admin"
            ? "Super Admin Panel"
            : normalizedRole === "admin"
                ? "Admin Dashboard"
                : "My Account"

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#02030a]/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[80px] w-full max-w-[1600px] items-center justify-between px-5 lg:px-8 xl:px-10">

                <a
                    href="/#home"
                    onClick={event =>
                        handleSectionClick(
                            event,
                            "#home"
                        )
                    }
                    className="mt-3 flex h-full w-[350px] shrink-0 items-center"
                >
                    <img
                        src={logoHorizontal}
                        alt="GoldenSweep"
                        className="h-[250px] w-[300px] object-contain object-left"
                    />
                </a>

                <nav className="hidden h-full items-center gap-10 xl:flex">
                    {navigationItems.map(item => {
                        const sectionId =
                            item.href.replace("#", "")

                        const active =
                            activeSection === sectionId

                        return (
                            <a
                                key={item.label}
                                href={`/${item.href}`}
                                onClick={event =>
                                    handleSectionClick(
                                        event,
                                        item.href
                                    )
                                }
                                className={`relative flex h-full items-center text-[14px] font-semibold uppercase tracking-[0.025em] transition-colors duration-300 ${active
                                    ? "text-[#ffd05a]"
                                    : "text-white/80 hover:text-[#ffd05a]"
                                    }`}
                            >
                                {item.label}

                                {active && (
                                    <>
                                        <span className="absolute bottom-[17px] left-1/2 h-[2px] w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ffc83d] to-transparent" />
                                        <span className="absolute bottom-[13px] left-1/2 h-[7px] w-14 -translate-x-1/2 bg-[#ffc83d]/20 blur-md" />
                                    </>
                                )}
                            </a>
                        )
                    })}
                </nav>

                <div className="hidden shrink-0 items-center gap-3 lg:flex">

                    {!authenticated ? (
                        <>
                            <Link
                                to="/login"
                                className="flex h-[46px] min-w-[125px] items-center justify-center rounded-[13px] border border-[#c59018]/70 bg-black/20 px-7 text-[14px] font-bold text-[#f3c74e] transition-all duration-300 hover:border-[#ffcf53] hover:bg-[#d39c16]/10"
                            >
                                LOGIN
                            </Link>

                            <Link
                                to="/signup"
                                className="relative flex h-[48px] min-w-[165px] items-center justify-center overflow-hidden rounded-[13px] bg-gradient-to-r from-[#d99b19] via-[#ffd35e] to-[#e49e17] px-7 text-[14px] font-black text-[#171006] shadow-[0_0_26px_rgba(255,185,31,0.28)] transition hover:scale-[1.025]"
                            >
                                GET STARTED
                            </Link>
                        </>
                    ) : (
                        <>
                            {isAdministrator ? (
                                <Link
                                    to={accountDestination}
                                    className="flex h-[46px] items-center gap-2 rounded-[13px] border border-[#d9a928]/40 bg-[#d9a928]/[0.08] px-4 text-[#f4c34c] transition hover:border-[#ffd05a]/70 hover:bg-[#d9a928]/[0.14]"
                                >
                                    <LayoutDashboard size={17} />

                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-white/35">
                                            Administration
                                        </p>

                                        <p className="text-xs font-black text-white">
                                            {accountLabel}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    to="/profile"
                                    className="flex h-[46px] items-center gap-2 rounded-[13px] border border-gold-400/20 bg-gold-400/[0.035] px-4"
                                >
                                    <WalletCards
                                        size={17}
                                        className="text-gold-400"
                                    />

                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-white/30">
                                            Balance
                                        </p>

                                        <p className="text-xs font-black text-white">
                                            1,250 GC
                                        </p>
                                    </div>
                                </Link>
                            )}

                            <div
                                ref={profileMenuRef}
                                className="relative"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setProfileOpen(
                                            current => !current
                                        )
                                    }
                                    className="flex h-[48px] items-center gap-3 rounded-[13px] border border-white/10 bg-[#060812]/90 px-2.5 pr-4 transition hover:border-gold-400/35"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gold-400/25 bg-gold-400/[0.06] text-xs font-black text-gold-300">
                                        {initials}
                                    </div>

                                    <div className="max-w-[120px] text-left">
                                        <p className="truncate text-xs font-black text-white">
                                            {profile?.full_name ||
                                                "GoldenSweep Player"}
                                        </p>

                                        <p className="text-[9px] text-white/30">
                                            My Account
                                        </p>
                                    </div>

                                    <ChevronDown
                                        size={14}
                                        className={`text-gold-400/70 transition ${profileOpen
                                            ? "rotate-180"
                                            : ""
                                            }`}
                                    />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 top-[58px] w-[250px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#080a13]/98 p-2 shadow-[0_25px_70px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                                        <div className="border-b border-white/[0.06] px-3 py-3">
                                            <p className="truncate text-sm font-black text-white">
                                                {profile?.full_name ||
                                                    "GoldenSweep Player"}
                                            </p>

                                            <p className="mt-1 truncate text-[10px] text-white/35">
                                                {profile?.email}
                                            </p>
                                        </div>

                                        {isAdministrator && (
                                            <MenuLink
                                                to={accountDestination}
                                                icon={
                                                    <LayoutDashboard
                                                        size={16}
                                                    />
                                                }
                                                label={accountLabel}
                                                onClick={() =>
                                                    setProfileOpen(false)
                                                }
                                            />
                                        )}

                                        <MenuLink
                                            to="/profile"
                                            icon={<User size={16} />}
                                            label="My Profile"
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                        />

                                        {!isAdministrator && (


                                            <MenuLink
                                                to="/profile"
                                                icon={
                                                    <WalletCards
                                                        size={16}
                                                    />
                                                }
                                                label="Wallet"
                                                onClick={() =>
                                                    setProfileOpen(false)
                                                }
                                            />


                                        )}

                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-red-300/80 transition hover:bg-red-500/[0.06] hover:text-red-200"
                                        >
                                            <LogOut size={16} />
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    aria-label="Toggle navigation"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white lg:hidden"
                    onClick={() =>
                        setMenuOpen(current => !current)
                    }
                >
                    {menuOpen ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}
                </button>
            </div>

            {menuOpen && (
                <div className="border-t border-white/[0.07] bg-[#03040b]/98 px-5 py-6 backdrop-blur-2xl lg:hidden">
                    <div className="flex flex-col">
                        {navigationItems.map(item => (
                            <a
                                key={item.label}
                                href={`/${item.href}`}
                                onClick={event =>
                                    handleSectionClick(
                                        event,
                                        item.href
                                    )
                                }
                                className="border-b border-white/[0.05] py-4 text-sm font-bold uppercase tracking-wide text-white/75 transition hover:text-[#ffd05a]"
                            >
                                {item.label}
                            </a>
                        ))}

                        {authenticated ? (
                            <div className="mt-5 space-y-3">
                                <Link
                                    to={accountDestination}
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                    className="flex items-center gap-3 rounded-xl border border-gold-400/20 bg-gold-400/[0.035] p-3"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gold-400/25 text-xs font-black text-gold-300">
                                        {isAdministrator ? (
                                            <LayoutDashboard
                                                size={18}
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-black text-white">
                                            {profile?.full_name ||
                                                "My Profile"}
                                        </p>

                                        <p className="text-xs text-gold-300">
                                            {isAdministrator
                                                ? accountLabel
                                                : "My Account"}
                                        </p>
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.04] text-sm font-black text-red-200"
                                >
                                    <LogOut size={16} />
                                    LOG OUT
                                </button>
                            </div>
                        ) : (
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Link
                                    to="/login"
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                    className="flex h-12 items-center justify-center rounded-xl border border-[#b8861c]/70 font-bold text-[#f0c34b]"
                                >
                                    LOGIN
                                </Link>

                                <Link
                                    to="/signup"
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                    className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#e6a822] via-[#ffd45a] to-[#db9616] font-black text-black"
                                >
                                    GET STARTED
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

const MenuLink = ({
    to,
    icon,
    label,
    onClick,
}: {
    to: string
    icon: React.ReactNode
    label: string
    onClick: () => void
}) => (
    <Link
        to={to}
        onClick={onClick}
        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold text-white/65 transition hover:bg-white/[0.04] hover:text-gold-300"
    >
        {icon}
        {label}
    </Link>
)

export default Navbar
