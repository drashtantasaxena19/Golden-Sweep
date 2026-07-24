import { motion } from "framer-motion"
import {
    ShieldCheck,
    Trophy,
    UsersRound,
    Zap,
} from "lucide-react"

import logoOnly from "../../assets/branding/logo_only.png"
import heroBg from "../../assets/images/hero-bg.png"

const HeroSection = () => {
    return (
        <section
            id="home"
            className="
                relative
                mt-[80px]
                min-h-[calc(100vh-80px)]
                scroll-mt-[80px]
                overflow-hidden
                bg-[#02030a]
            "
        >
            {/* =========================
                FULL HERO BACKGROUND
            ========================== */}
            <div className="absolute inset-0">
                <img
                    src={heroBg}
                    alt=""
                    className="
                        h-full
                        w-full
                        object-cover
                        object-center
                    "
                />

                {/* Bottom fade */}
                <div
                    className="
                        absolute
                        inset-0
                        bg-[linear-gradient(
                            to_bottom,
                            rgba(1,2,7,0.02)_0%,
                            rgba(1,2,7,0.04)_45%,
                            rgba(2,3,10,0.30)_72%,
                            rgba(2,3,10,0.82)_100%
                        )]
                    "
                />

                {/* Center dark readability zone */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-[43%]
                        h-[560px]
                        w-[760px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-[#020817]/25
                        blur-[70px]
                    "
                />

                {/* subtle edge vignette */}
                <div
                    className="
                        absolute
                        inset-0
                        shadow-[inset_0_0_160px_rgba(0,0,0,0.5)]
                    "
                />
            </div>

            {/* =========================
                HERO CONTENT
            ========================== */}
            <div
                className="
                    relative
                    z-10
                    mx-auto
                    flex
                    min-h-[calc(100vh-80px)]
                    max-w-[1600px]
                    flex-col
                    items-center
                    px-5
                    text-center
                    lg:px-10
                "
            >
                {/* =========================
                    LOGO AREA
                ========================== */}
                <div
                    className="
                        relative
                        mt-[38px]
                        flex
                        items-center
                        justify-center
                    "
                >
                    {/* LARGE GOLDEN AURA */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.65,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            duration: 1,
                        }}
                        className="
                            absolute
                            h-[350px]
                            w-[350px]
                            rounded-full
                            bg-[radial-gradient(
                                circle,
                                rgba(255,194,55,0.35)_0%,
                                rgba(255,166,0,0.20)_28%,
                                rgba(255,153,0,0.08)_52%,
                                transparent_72%
                            )]
                            blur-[18px]
                        "
                    />

                    {/* SECOND INNER GLOW */}
                    <div
                        className="
                            absolute
                            h-[250px]
                            w-[250px]
                            rounded-full
                            bg-[#ffb900]/12
                            blur-[45px]
                        "
                    />

                    {/* GOLD RING GLOW */}
                    <motion.div
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 24,
                            ease: "linear",
                        }}
                        className="
                            absolute
                            h-[270px]
                            w-[270px]
                            rounded-full
                            border
                            border-[#d9a42e]/12
                            shadow-[0_0_65px_rgba(255,186,45,0.14)]
                        "
                    />

                    {/* ACTUAL APPROVED LOGO */}
                    <motion.img
                        src={logoOnly}
                        alt="GoldenSweep"
                        initial={{
                            opacity: 0,
                            scale: 0.75,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.85,
                            ease: "easeOut",
                        }}
                        className="
                            relative
                            z-10
                            w-[310px]
                            object-contain
                            drop-shadow-[0_0_18px_rgba(255,210,90,0.65)]
                            sm:w-[360px]
                            lg:w-[410px]
                            xl:w-[450px]
                        "
                    />
                </div>

                {/* =========================
                    MAIN TITLE
                ========================== */}
                <motion.h1
                    initial={{
                        opacity: 0,
                        y: 24,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.75,
                        delay: 0.12,
                    }}
                    className="
                        -mt-[28px]
                        bg-gradient-to-b
                        from-[#fff5bd]
                        via-[#ffd35f]
                        to-[#ad6b00]
                        bg-clip-text
                        font-serif
                        text-[48px]
                        font-black
                        leading-[0.9]
                        tracking-[-0.045em]
                        text-transparent

                        drop-shadow-[0_5px_10px_rgba(0,0,0,0.85)]

                        sm:text-[66px]
                        md:text-[76px]
                        lg:text-[90px]
                        xl:text-[98px]
                    "
                >
                    GOLDENSWEEP
                </motion.h1>

                {/* =========================
                    TAGLINE
                ========================== */}
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        delay: 0.25,
                    }}
                    className="
                        mt-4
                        flex
                        items-center
                        justify-center
                        gap-4
                    "
                >
                    <span
                        className="
                            h-px
                            w-12
                            bg-gradient-to-r
                            from-transparent
                            to-[#d3a32d]
                            sm:w-20
                            lg:w-28
                        "
                    />

                    <p
                        className="
                            whitespace-nowrap
                            text-[11px]
                            font-bold
                            tracking-[0.32em]
                            text-white/95

                            sm:text-[14px]
                            md:text-[16px]
                            lg:text-[18px]
                        "
                    >
                        ENTER THE GOLDEN WORLD
                    </p>

                    <span
                        className="
                            h-px
                            w-12
                            bg-gradient-to-l
                            from-transparent
                            to-[#d3a32d]
                            sm:w-20
                            lg:w-28
                        "
                    />
                </motion.div>

                {/* =========================
                    SUB TEXT
                ========================== */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.34,
                    }}
                    className="
                        mt-4
                        text-[14px]
                        leading-[1.55]
                        text-white/88

                        sm:text-[16px]
                        lg:text-[17px]
                    "
                >
                    <p>
                        One Account. Multiple Gaming Worlds.
                    </p>

                    <p className="font-medium">
                        Buy Credits

                        <span className="mx-2 text-[#e6ad2f]">
                            •
                        </span>

                        Recharge

                        <span className="mx-2 text-[#e6ad2f]">
                            •
                        </span>

                        Play
                    </p>
                </motion.div>

                {/* =========================
                    CTA BUTTONS
                ========================== */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.43,
                    }}
                    className="
                        mt-5
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-3
                        sm:flex-row
                    "
                >
                    <a
                        href="#get-started"
                        className="
                            relative
                            flex
                            h-[48px]
                            min-w-[190px]
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-[13px]

                            bg-gradient-to-r
                            from-[#d59316]
                            via-[#ffd45d]
                            to-[#d89112]

                            px-9
                            text-[14px]
                            font-black
                            text-[#171006]

                            shadow-[0_0_30px_rgba(255,180,28,0.35)]

                            transition
                            duration-300

                            hover:scale-[1.035]
                            hover:shadow-[0_0_42px_rgba(255,185,30,0.5)]
                        "
                    >
                        GET STARTED

                        <span
                            className="
                                absolute
                                inset-x-5
                                top-0
                                h-px
                                bg-gradient-to-r
                                from-transparent
                                via-white/80
                                to-transparent
                            "
                        />
                    </a>

                    <a
                        href="#games"
                        className="
                            flex
                            h-[48px]
                            min-w-[190px]
                            items-center
                            justify-center

                            rounded-[13px]

                            border
                            border-[#ba8920]/65

                            bg-black/35

                            px-9

                            text-[14px]
                            font-black
                            text-[#f1c348]

                            backdrop-blur-md

                            transition
                            duration-300

                            hover:border-[#e3b53b]
                            hover:bg-[#bd8b1b]/12
                        "
                    >
                        EXPLORE GAMES

                        <span className="ml-3 text-xl">
                            ›
                        </span>
                    </a>
                </motion.div>

                {/* =========================
                    LARGE STATS BAR
                ========================== */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 25,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.58,
                    }}
                    className="
                        absolute
                        bottom-[24px]
                        left-1/2

                        grid

                        w-[min(94%,900px)]

                        -translate-x-1/2

                        grid-cols-2

                        overflow-hidden

                        rounded-[17px]

                        border
                        border-white/[0.08]

                        bg-[#03040a]/90

                        shadow-[0_20px_60px_rgba(0,0,0,0.48)]

                        backdrop-blur-xl

                        md:grid-cols-4
                    "
                >
                    <HeroStat
                        icon={
                            <UsersRound size={25} />
                        }
                        value="10+"
                        label="Gaming Worlds"
                    />

                    <HeroStat
                        icon={
                            <ShieldCheck size={25} />
                        }
                        value="100%"
                        label="Safe & Secure"
                    />

                    <HeroStat
                        icon={
                            <Zap size={26} />
                        }
                        value="Fast"
                        label="Recharge Flow"
                    />

                    <HeroStat
                        icon={
                            <Trophy size={25} />
                        }
                        value="24/7"
                        label="Support"
                        last
                    />
                </motion.div>
            </div>
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    h-[220px]
                    bg-gradient-to-b
                    from-transparent
                    via-[#02030a]/55
                    to-[#02030a]
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    -bottom-24
                    h-48
                    bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.08),transparent_65%)]
                    blur-2xl
                "           
            />
        </section>
    )
}

interface HeroStatProps {
    icon: React.ReactNode
    value: string
    label: string
    last?: boolean
}

const HeroStat = ({
    icon,
    value,
    label,
    last = false,
}: HeroStatProps) => {
    return (
        <div
            className={`
                relative

                flex

                min-h-[90px]

                items-center
                justify-center

                gap-4

                px-6

                ${!last
                    ? `
                        md:after:absolute
                        md:after:right-0
                        md:after:top-1/2
                        md:after:h-[42px]
                        md:after:w-px
                        md:after:-translate-y-1/2
                        md:after:bg-white/10
                        `
                    : ""
                }
            `}
        >
            {/* ICON */}
            <div
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d59b16]/8

                    text-[#ffc62f]
                "
            >
                {icon}
            </div>

            {/* TEXT */}
            <div className="text-left">
                <div
                    className="
                        text-[20px]
                        font-black
                        leading-none
                        text-white

                        lg:text-[22px]
                    "
                >
                    {value}
                </div>

                <div
                    className="
                        mt-1.5
                        text-[11px]
                        font-medium
                        text-white/45

                        lg:text-[12px]
                    "
                >
                    {label}
                </div>
            </div>
        </div>
    )
}

export default HeroSection