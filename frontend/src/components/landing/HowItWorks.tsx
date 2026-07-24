import {
    Gamepad2,
    Rocket,
    UserPlus,
    WalletCards,
} from "lucide-react"

const steps = [
    {
        number: "1",
        icon: UserPlus,
        title: "CREATE ACCOUNT",
        description: "Quick and easy sign up",
    },
    {
        number: "2",
        icon: WalletCards,
        title: "ADD CREDITS",
        description: "Choose your payment",
    },
    {
        number: "3",
        icon: Gamepad2,
        title: "CHOOSE GAME",
        description: "Pick your favorite game",
    },
    {
        number: "4",
        icon: Rocket,
        title: "RECHARGE & PLAY",
        description: "Enjoy your game",
    },
]

const HowItWorks = () => {
    return (
        <section
            id="how-it-works"
            className="relative overflow-hidden bg-[#02030a] px-4 pb-6 pt-5 sm:px-6 lg:px-8"
        >
            {/* soft gold ambience */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[850px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,184,0,.055),transparent_72%)] blur-2xl" />

            <div className="relative mx-auto max-w-[1420px]">
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-[18px]
                        border
                        border-[#926817]/55
                        bg-[linear-gradient(180deg,#080a12,#03040a)]
                        shadow-[0_18px_45px_rgba(0,0,0,.34)]
                    "
                >
                    {/* top highlight */}
                    <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#e0ad35]/60 to-transparent" />

                    {/* inner ambient glow */}
                    <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-[620px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,180,0,.08),transparent_72%)]" />

                    <div className="relative pt-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#b78522]" />

                            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#e7b338]">
                                HOW IT WORKS
                            </p>

                            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#b78522]" />
                        </div>
                    </div>

                    <div className="relative grid grid-cols-1 gap-0 px-3 pb-5 pt-3 md:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon

                            return (
                                <div
                                    key={step.number}
                                    className="
                                        group
                                        relative
                                        flex
                                        min-h-[110px]
                                        items-center
                                        gap-4
                                        rounded-xl
                                        px-5
                                        transition
                                        duration-300
                                        hover:bg-white/[0.015]
                                    "
                                >
                                    {/* connector */}
                                    {index < steps.length - 1 && (
                                        <>
                                            <div className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-[#8f651a]/20 to-[#c18c23]/65 lg:block" />

                                            <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-[2px] lg:block">
                                                <span className="block h-4 w-4 rotate-45 border-r-2 border-t-2 border-[#a6781d]/65" />
                                            </div>
                                        </>
                                    )}

                                    {/* icon */}
                                    <div
                                        className="
                                            relative
                                            flex
                                            h-[68px]
                                            w-[68px]
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-[#af7d1d]/30
                                            bg-[radial-gradient(circle,rgba(231,168,31,.18),rgba(231,168,31,.05)_55%,transparent_75%)]
                                            text-[#f0b52d]
                                            shadow-[0_0_22px_rgba(218,155,23,.08)]
                                            transition
                                            duration-300
                                            group-hover:border-[#e3ad32]/50
                                            group-hover:shadow-[0_0_28px_rgba(255,184,0,.14)]
                                        "
                                    >
                                        <div className="absolute inset-2 rounded-full border border-[#d7a62c]/10" />

                                        <Icon
                                            size={29}
                                            strokeWidth={1.8}
                                            className="relative z-10"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-end gap-3">
                                            <span className="text-[26px] font-black leading-none text-[#ffc83a]">
                                                {step.number}
                                            </span>

                                            <h3 className="truncate text-[13px] font-black leading-none text-white">
                                                {step.title}
                                            </h3>
                                        </div>

                                        <p className="mt-2 text-[11px] leading-[1.45] text-white/45">
                                            {step.description}
                                        </p>

                                        <div className="mt-3 h-px w-0 bg-gradient-to-r from-[#e2ad2f] to-transparent transition-all duration-300 group-hover:w-16" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks