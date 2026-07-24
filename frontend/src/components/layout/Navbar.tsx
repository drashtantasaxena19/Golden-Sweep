import { ChevronDown, Globe2, Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import type { MouseEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import logoHorizontal from "../../assets/branding/logo_horizontal.png"
import { navigationItems } from "../../config/navigation"

const NAVBAR_HEIGHT = 80
const SCROLL_GAP = 28
const SCROLL_OFFSET = NAVBAR_HEIGHT + SCROLL_GAP

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("home")
    const location = useLocation()
    const navigate = useNavigate()

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

        window.history.replaceState(
            null,
            "",
            href
        )

        scrollToSection(sectionId)
    }

    useEffect(() => {
        if (location.pathname !== "/") {
            setActiveSection("")
            return
        }

        const handleScroll = () => {
            const sections = navigationItems
                .map(item =>
                    item.href.replace("#", "")
                )
                .map(id =>
                    document.getElementById(id)
                )
                .filter(Boolean) as HTMLElement[]

            let current = "home"

            const position =
                window.scrollY +
                SCROLL_OFFSET +
                10

            for (const section of sections) {
                if (
                    position >=
                    section.offsetTop
                ) {
                    current = section.id
                }
            }

            setActiveSection(current)
        }

        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true,
            }
        )

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

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#02030a]/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[80px] w-full max-w-[1600px] items-center justify-between px-5 lg:px-8 xl:px-10">

                {/* LOGO */}
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

                {/* DESKTOP NAV */}
                <nav className="hidden h-full items-center gap-10 xl:flex">
                    {navigationItems.map(item => {
                        const sectionId =
                            item.href.replace(
                                "#",
                                ""
                            )

                        const active =
                            activeSection ===
                            sectionId

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

                {/* DESKTOP RIGHT */}
                <div className="hidden shrink-0 items-center gap-3 lg:flex">

                    {/* LANGUAGE */}
                    <button
                        type="button"
                        className="flex h-[44px] items-center gap-2 rounded-[13px] border border-white/10 bg-[#060812]/90 px-4 text-[13px] font-semibold text-white/90 transition hover:border-[#d9a928]/45"
                    >
                        <Globe2
                            size={15}
                            className="text-[#e3bd51]"
                        />

                        <span>EN</span>

                        <ChevronDown
                            size={14}
                            className="text-[#d5aa42]"
                        />
                    </button>

                    <button
                        type="button"
                        className="px-2 text-[13px] font-medium text-white/35 transition hover:text-[#f4c34c]"
                    >
                        ES
                    </button>

                    {/* LOGIN ROUTE */}
                    <Link
                        to="/login"
                        className="flex h-[46px] min-w-[125px] items-center justify-center rounded-[13px] border border-[#c59018]/70 bg-black/20 px-7 text-[14px] font-bold text-[#f3c74e] transition-all duration-300 hover:border-[#ffcf53] hover:bg-[#d39c16]/10 hover:shadow-[0_0_22px_rgba(255,190,42,0.12)]"
                    >
                        LOGIN
                    </Link>

                    {/* SIGNUP ROUTE */}
                    <Link
                        to="/signup"
                        className="relative flex h-[48px] min-w-[165px] items-center justify-center overflow-hidden rounded-[13px] bg-gradient-to-r from-[#d99b19] via-[#ffd35e] to-[#e49e17] px-7 text-[14px] font-black text-[#171006] shadow-[0_0_26px_rgba(255,185,31,0.28)] transition hover:scale-[1.025] hover:shadow-[0_0_35px_rgba(255,190,35,0.42)]"
                    >
                        <span className="relative z-10">
                            GET STARTED
                        </span>

                        <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                    </Link>
                </div>

                {/* MOBILE MENU */}
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

            {/* MOBILE DROPDOWN */}
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

                        <div className="mt-5 flex items-center gap-3">
                            <button
                                type="button"
                                className="flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/80"
                            >
                                <Globe2 size={16} />

                                EN

                                <ChevronDown
                                    size={14}
                                />
                            </button>

                            <button
                                type="button"
                                className="text-sm text-white/40"
                            >
                                ES
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                            {/* MOBILE LOGIN */}
                            <Link
                                to="/login"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                                className="flex h-12 items-center justify-center rounded-xl border border-[#b8861c]/70 font-bold text-[#f0c34b]"
                            >
                                LOGIN
                            </Link>

                            {/* MOBILE SIGNUP */}
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
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar