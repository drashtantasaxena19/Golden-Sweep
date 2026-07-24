import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ShieldCheck, Sparkles } from "lucide-react"
import Navbar from "../layout/Navbar"
import logoMark from "../../assets/branding/logo_only.png"
import heroBackground from "../../assets/images/hero-bg.png"

interface AuthLayoutProps {
    children: ReactNode
    mode?: "login" | "signup"
    eyebrow?: string
    title?: string
    description?: string
    footerText?: string
    footerLinkText?: string
    footerLinkTo?: string
}

const AuthLayout = ({
    children,
    mode = "login",
    eyebrow,
    title,
    description,
    footerText,
    footerLinkText,
    footerLinkTo,
}: AuthLayoutProps) => {
    const isSignup = mode === "signup"

    return (
        <div className="min-h-screen bg-[#02030a] text-white">
            <Navbar />

            <main className="relative min-h-[calc(100vh-80px)] overflow-hidden pt-[80px]">
                <img
                    src={heroBackground}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,10,.42)_0%,rgba(2,3,10,.58)_42%,rgba(2,3,10,.78)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,10,.02),rgba(2,3,10,.12)_58%,rgba(2,3,10,.72)_100%)]" />

                <div className="pointer-events-none absolute left-[5%] top-[8%] h-[520px] w-[520px] rounded-full bg-[#e5a21a]/10 blur-[150px]" />
                <div className="pointer-events-none absolute right-[5%] top-[12%] h-[480px] w-[480px] rounded-full bg-purple-700/[0.08] blur-[160px]" />

                <div
                    className={`relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1700px] ${isSignup
                        ? "lg:grid-cols-[0.92fr_1.08fr]"
                        : "lg:grid-cols-[1.02fr_.98fr]"
                        }`}
                >
                    <section className={`relative min-h-[calc(100vh-80px)] overflow-hidden border-r border-white/[0.06] ${isSignup ? "hidden" : "hidden lg:block"}`}>
                        <div className="absolute inset-0 flex flex-col justify-between px-10 py-8 xl:px-14">
                            <div className="flex flex-1 flex-col justify-center">
                                <div className="relative h-[235px] w-full max-w-[650px]">
                                    <div className="pointer-events-none absolute left-[190px] top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5a21a]/16 blur-[80px]" />

                                    <div className="pointer-events-none absolute left-[190px] top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,205,70,.14),rgba(255,168,0,.04)_48%,transparent_72%)]" />

                                    <img
                                        src={logoMark}
                                        alt="GoldenSweep GS"
                                        className="absolute -left-[55px] top-1/2 h-[390px] w-[520px] -translate-y-1/2 object-contain drop-shadow-[0_0_55px_rgba(255,183,20,.52)]"
                                    />
                                </div>

                                <div className="relative z-10 mt-1 max-w-[690px]">
                                    <p className="text-[12px] font-black uppercase tracking-[0.34em] text-[#ffc83d]">
                                        ENTER THE GOLDEN WORLD
                                    </p>

                                    <h1 className="mt-5 text-[46px] font-black leading-[1.03] tracking-[-0.035em] text-white drop-shadow-[0_5px_20px_rgba(0,0,0,.55)] xl:text-[57px]">
                                        One account.
                                        <span className="mt-1.5 block bg-gradient-to-r from-[#ffe16f] via-[#ffc32c] to-[#e99d16] bg-clip-text text-transparent">
                                            Every gaming world.
                                        </span>
                                    </h1>

                                    <p className="mt-5 max-w-[650px] text-[15px] font-medium leading-7 text-white/72 drop-shadow-[0_2px_10px_rgba(0,0,0,.8)] xl:text-[16px]">
                                        Access your GoldenSweep wallet, manage credits, explore supported games,
                                        track recharge activity, and keep everything connected from one secure account.
                                    </p>

                                    <div className="mt-7 grid max-w-[640px] grid-cols-2 gap-4">
                                        <FeatureCard
                                            icon={<ShieldCheck size={20} />}
                                            title="Secure Access"
                                            text="Protected account and session flows"
                                        />

                                        <FeatureCard
                                            icon={<Sparkles size={20} />}
                                            title="Premium Experience"
                                            text="One polished gaming ecosystem"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="pt-4 text-xs text-white/30">
                                © 2026 GoldenSweep. All rights reserved.
                            </p>
                        </div>
                    </section>

                    <section
                        className={`relative flex justify-center ${isSignup
                            ? "col-span-full items-start px-4 py-7 sm:px-6 lg:px-8"
                            : "items-center px-4 py-8 sm:px-7 lg:px-10 xl:px-14"
                            }`}
                    >
                        <div
                            className={`relative w-full ${isSignup
                                ? "max-w-[1280px] xl:w-[82vw]"
                                : "max-w-[610px]"
                                }`}
                        >
                            <div className="pointer-events-none absolute -inset-8 rounded-[50px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,190,40,.08),transparent_55%)] blur-2xl" />

                            <div className="relative overflow-hidden rounded-[30px] border border-[#d7a52c]/30 bg-[linear-gradient(145deg,rgba(7,8,18,.96),rgba(12,8,27,.95))] shadow-[0_30px_100px_rgba(0,0,0,.65),0_0_45px_rgba(255,184,0,.05)] backdrop-blur-2xl">
                                <div className="absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-[#f4bd36]/90 to-transparent" />
                                <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[280px] w-[280px] rounded-full bg-purple-700/[0.08] blur-[90px]" />

                                <div
                                    className={`relative ${isSignup
                                        ? "px-6 py-7 sm:px-9 lg:px-10"
                                        : "px-6 py-8 sm:px-10 lg:px-11"
                                        }`}
                                >
                                    <div className="mb-4 flex justify-center lg:hidden">
                                        <div className="relative h-[145px] w-[230px]">
                                            <div className="absolute left-1/2 top-1/2 h-[140px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e6a51c]/15 blur-[55px]" />

                                            <img
                                                src={logoMark}
                                                alt="GoldenSweep GS"
                                                className="absolute left-1/2 top-1/2 h-[210px] w-[280px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_0_36px_rgba(255,183,20,.48)]"
                                            />
                                        </div>
                                    </div>

                                    {(eyebrow || title || description) && (
                                        <div className={isSignup ? "mb-6" : "mb-7"}>
                                            {eyebrow && (
                                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#ffc83d]">
                                                    {eyebrow}
                                                </p>
                                            )}

                                            {title && (
                                                <h2
                                                    className={`mt-3 font-black leading-tight tracking-[-0.03em] text-white ${isSignup
                                                        ? "text-3xl sm:text-[37px]"
                                                        : "text-3xl sm:text-[40px]"
                                                        }`}
                                                >
                                                    {title}
                                                </h2>
                                            )}

                                            {description && (
                                                <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/60 sm:text-[15px]">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {children}

                                    {footerText && footerLinkText && footerLinkTo && (
                                        <div className="mt-6 border-t border-white/[0.07] pt-5 text-center text-sm text-white/45">
                                            <span>{footerText}</span>{" "}
                                            <Link
                                                to={footerLinkTo}
                                                className="font-bold text-[#ffd04d] transition-colors hover:text-[#ffe28b]"
                                            >
                                                {footerLinkText}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/30">
                                <Link to="/terms" className="transition hover:text-gold-300">
                                    Terms
                                </Link>

                                <Link to="/privacy" className="transition hover:text-gold-300">
                                    Privacy
                                </Link>

                                <Link to="/responsible-gaming" className="transition hover:text-gold-300">
                                    Responsible Gaming
                                </Link>

                                <Link to="/support" className="transition hover:text-gold-300">
                                    Support
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

interface FeatureCardProps {
    icon: ReactNode
    title: string
    text: string
}

const FeatureCard = ({
    icon,
    title,
    text,
}: FeatureCardProps) => (
    <div className="rounded-2xl border border-[#d9a62a]/20 bg-[#05060d]/75 p-4 shadow-[0_16px_45px_rgba(0,0,0,.28)] backdrop-blur-md">
        <div className="text-[#ffc83d]">
            {icon}
        </div>

        <h3 className="mt-3 text-sm font-black text-white">
            {title}
        </h3>

        <p className="mt-1.5 text-xs leading-5 text-white/45">
            {text}
        </p>
    </div>
)

export default AuthLayout