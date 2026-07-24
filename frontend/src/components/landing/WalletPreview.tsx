import {
    ArrowDownToLine,
    ArrowUpRight,
    Gift,
    History,
    Plus,
    ShieldCheck,
    Sparkles,
    WalletCards,
} from "lucide-react"

import creditCoin from "../../assets/branding/credit_coin.png"

const WalletPreview = () => {
    return (
        <section
            className="
                relative
                overflow-hidden
                bg-[#050711]
                py-24
            "
        >
            {/* GOLD / PURPLE AMBIENT BACKGROUND */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-[-10%]
                    top-[12%]
                    h-[420px]
                    w-[420px]
                    rounded-full
                    bg-[#d79c18]/5
                    blur-[110px]
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    right-[-8%]
                    top-[5%]
                    h-[520px]
                    w-[520px]
                    rounded-full
                    bg-[#7c23d6]/8
                    blur-[130px]
                "
            />

            <div
                className="
                    relative
                    mx-auto
                    grid
                    max-w-[1400px]
                    gap-8
                    px-5
                    lg:grid-cols-[1.1fr_.9fr]
                    lg:px-10
                "
            >
                {/* =========================================
                    LEFT CONTENT
                ========================================== */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <span
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#b07b1c]/35
                                bg-[#d59a18]/8
                                text-[#f2bf3c]
                            "
                        >
                            <WalletCards size={20} />
                        </span>

                        <p
                            className="
                                text-xs
                                font-bold
                                tracking-[0.3em]
                                text-gold-400
                            "
                        >
                            YOUR GOLDENSWEEP WALLET
                        </p>
                    </div>

                    <h2
                        className="
                            mt-4
                            max-w-3xl
                            text-4xl
                            font-black
                            leading-[1.05]
                            text-white
                            md:text-5xl
                        "
                    >
                        Credits, ready when you are.
                    </h2>

                    <p
                        className="
                            mt-5
                            max-w-2xl
                            text-lg
                            leading-8
                            text-white/50
                        "
                    >
                        Buy Golden Credits through available payment methods,
                        track every transaction, and use your balance to request
                        game recharges.
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-[#d79517]
                                via-[#ffd45e]
                                to-[#dc9715]
                                px-6
                                py-3
                                font-black
                                text-black
                                shadow-[0_0_26px_rgba(255,184,0,.18)]
                                transition
                                hover:scale-[1.025]
                                hover:shadow-[0_0_36px_rgba(255,184,0,.3)]
                            "
                        >
                            <Plus size={18} />
                            ADD CREDITS
                        </button>

                        <button
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/10
                                bg-white/[0.02]
                                px-6
                                py-3
                                font-bold
                                text-white/80
                                transition
                                hover:border-gold-400/30
                                hover:bg-gold-400/5
                            "
                        >
                            <History size={18} />
                            TRANSACTION HISTORY
                        </button>
                    </div>

                    {/* MINI FEATURE ROW */}
                    <div
                        className="
                            mt-10
                            grid
                            gap-3
                            sm:grid-cols-3
                        "
                    >
                        <WalletFeature
                            icon={<ShieldCheck size={19} />}
                            title="Secure Wallet"
                            text="Protected credit activity"
                        />

                        <WalletFeature
                            icon={<ArrowDownToLine size={19} />}
                            title="Fast Funding"
                            text="Quick credit purchase flow"
                        />

                        <WalletFeature
                            icon={<Gift size={19} />}
                            title="Bonus Ready"
                            text="Promotions and rewards"
                        />
                    </div>
                </div>

                {/* =========================================
                    RIGHT WALLET CARD
                ========================================== */}
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-[#7c33cf]/40

                        bg-[radial-gradient(circle_at_82%_18%,rgba(146,51,255,.42),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(255,183,30,.10),transparent_28%),linear-gradient(135deg,#0c0b1a,#130727_56%,#090b15)]

                        p-7

                        shadow-[0_30px_70px_rgba(0,0,0,.38)]
                    "
                >
                    {/* TOP GOLD EDGE */}
                    <div
                        className="
                            absolute
                            inset-x-10
                            top-0
                            h-px
                            bg-gradient-to-r
                            from-transparent
                            via-[#f2bd42]/80
                            to-transparent
                        "
                    />

                    {/* PURPLE ENERGY */}
                    <div
                        className="
                            absolute
                            -right-20
                            -top-20
                            h-64
                            w-64
                            rounded-full
                            bg-[#8f31ff]/20
                            blur-[70px]
                        "
                    />

                    <div
                        className="
                            absolute
                            bottom-[-70px]
                            left-[-40px]
                            h-52
                            w-52
                            rounded-full
                            bg-[#d79c1a]/8
                            blur-[65px]
                        "
                    />

                    <div className="relative min-h-[330px]">
                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Sparkles
                                        size={16}
                                        className="text-[#f0bd40]"
                                    />

                                    <p
                                        className="
                                            text-xs
                                            font-bold
                                            tracking-[0.25em]
                                            text-gold-300
                                        "
                                    >
                                        AVAILABLE BALANCE
                                    </p>
                                </div>

                                <div className="mt-2 flex items-end gap-3">
                                    <span
                                        className="
                                            text-5xl
                                            font-black
                                            text-white
                                        "
                                    >
                                        1,250
                                    </span>

                                    <span
                                        className="
                                            pb-2
                                            text-lg
                                            font-black
                                            text-gold-400
                                        "
                                    >
                                        GC
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-white/40">
                                    Golden Credits
                                </p>
                            </div>

                            <span
                                className="
                                    rounded-full
                                    border
                                    border-[#c18a21]/25
                                    bg-black/20
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-[#f2c14b]
                                "
                            >
                                ACTIVE
                            </span>
                        </div>

                        {/* DECORATIVE RINGS */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                bottom-[-25px]
                                right-[-15px]
                                h-[250px]
                                w-[250px]
                                rounded-full
                                border
                                border-[#ce9627]/10
                            "
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute
                                bottom-[10px]
                                right-[20px]
                                h-[190px]
                                w-[190px]
                                rounded-full
                                border
                                border-[#ce9627]/8
                            "
                        />

                        {/* COIN */}
                        <img
                            src={creditCoin}
                            alt="GoldenSweep Credit"
                            className="
                                absolute
                                bottom-[18px]
                                right-[8px]
                                w-52
                                max-w-[52%]
                                object-contain

                                drop-shadow-[0_0_28px_rgba(255,184,0,.34)]
                            "
                        />

                        {/* WALLET MINI PANEL */}
                        <div
                            className="
                                absolute
                                bottom-4
                                left-0
                                z-10
                                w-[58%]
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/25
                                p-4
                                backdrop-blur-xl
                            "
                        >
                            <p
                                className="
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white/35
                                "
                            >
                                RECENT ACTIVITY
                            </p>

                            <div
                                className="
                                    mt-3
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >
                                <div>
                                    <p className="text-sm font-black text-white">
                                        FireKirin Recharge
                                    </p>

                                    <p className="mt-1 text-xs text-white/40">
                                        Completed
                                    </p>
                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-1
                                        text-sm
                                        font-black
                                        text-[#f2bd3f]
                                    "
                                >
                                    200 GC
                                    <ArrowUpRight size={15} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                LOWER CREDIT INFO STRIP
            ========================================== */}
            <div
                className="
                    relative
                    mx-auto
                    mt-12
                    max-w-[1400px]
                    px-5
                    lg:px-10
                "
            >
                <div
                    className="
                        grid
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/[0.07]
                        bg-[#070912]
                        sm:grid-cols-3
                    "
                >
                    <CreditInfo
                        title="1 USD"
                        value="10 GC"
                        subtitle="Example conversion rate"
                    />

                    <CreditInfo
                        title="Game Recharge"
                        value="Manual / Configurable"
                        subtitle="Depends on provider settings"
                    />

                    <CreditInfo
                        title="Transaction Records"
                        value="Always Tracked"
                        subtitle="Clear wallet activity history"
                        last
                    />
                </div>
            </div>
        </section>
    )
}

interface WalletFeatureProps {
    icon: React.ReactNode
    title: string
    text: string
}

const WalletFeature = ({
    icon,
    title,
    text,
}: WalletFeatureProps) => {
    return (
        <div
            className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-white/[0.02]
                p-4
            "
        >
            <div className="text-[#efb93b]">
                {icon}
            </div>

            <p className="mt-3 text-sm font-black text-white">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/38">
                {text}
            </p>
        </div>
    )
}

interface CreditInfoProps {
    title: string
    value: string
    subtitle: string
    last?: boolean
}

const CreditInfo = ({
    title,
    value,
    subtitle,
    last = false,
}: CreditInfoProps) => {
    return (
        <div
            className={`
                relative
                p-6
                ${
                    !last
                        ? "sm:border-r sm:border-white/[0.07]"
                        : ""
                }
            `}
        >
            <p
                className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#d9a936]
                "
            >
                {title}
            </p>

            <p className="mt-2 text-lg font-black text-white">
                {value}
            </p>

            <p className="mt-1 text-xs text-white/38">
                {subtitle}
            </p>
        </div>
    )
}

export default WalletPreview