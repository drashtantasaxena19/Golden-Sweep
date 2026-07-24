import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { useRef, useState } from "react"
import { gameProviders } from "../../config/games"

const GamesSection = () => {
    const railRef = useRef<HTMLDivElement>(null)
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
    const move = (direction: "left" | "right") => railRef.current?.scrollBy({ left: direction === "left" ? -700 : 700, behavior: "smooth" })

    return (
        <section id="games" className="relative overflow-hidden bg-[#02030a] pb-7 pt-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_center_top,rgba(255,180,0,.09),transparent_70%)]" />
            <div className="relative mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-center justify-center gap-4">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-[#8d651e] to-[#c6922b] sm:w-24" />
                    <h2 className="whitespace-nowrap text-[11px] font-black uppercase tracking-[.22em] text-[#f2c143] sm:text-[13px]">YOUR FAVORITE GAMING WORLDS</h2>
                    <span className="h-px w-16 bg-gradient-to-l from-transparent via-[#8d651e] to-[#c6922b] sm:w-24" />
                </div>

                <div className="relative">
                    <button type="button" onClick={() => move("left")} aria-label="Previous games" className="absolute -left-2 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#b47d18]/60 bg-[#02030a]/95 text-[#f0b72d] shadow-[0_0_30px_rgba(0,0,0,.6)] transition hover:scale-110 hover:border-[#efb93b] lg:-left-5">
                        <ChevronLeft size={28} />
                    </button>
                    <button type="button" onClick={() => move("right")} aria-label="Next games" className="absolute -right-2 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#b47d18]/60 bg-[#02030a]/95 text-[#f0b72d] shadow-[0_0_30px_rgba(0,0,0,.6)] transition hover:scale-110 hover:border-[#efb93b] lg:-right-5">
                        <ChevronRight size={28} />
                    </button>

                    <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-12 bg-gradient-to-r from-[#02030a] to-transparent" />
                    <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-12 bg-gradient-to-l from-[#02030a] to-transparent" />

                    <div ref={railRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-8 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {gameProviders.map(game => {
                            const failed = failedImages[game.id]
                            return (
                                <a key={game.id} href={game.launchUrl} target="_blank" rel="noreferrer" className="group relative h-[170px] w-[170px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-[#a97619]/55 bg-[#060811] shadow-[0_12px_28px_rgba(0,0,0,.3)] transition duration-300 hover:-translate-y-1.5 hover:border-[#efb72f] hover:shadow-[0_16px_38px_rgba(0,0,0,.42),0_0_26px_rgba(255,176,20,.14)]">
                                    <div className="absolute inset-x-0 bottom-[38px] top-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,184,0,.11),transparent_58%),linear-gradient(180deg,#0c0d16,#070810)] p-4">
                                        {!failed ? (
                                            <img src={game.image} alt={game.name} loading="lazy" className="max-h-[148px] max-w-[172px] object-contain object-center drop-shadow-[0_5px_15px_rgba(0,0,0,.35)] transition duration-500 group-hover:scale-[1.07]" onError={() => setFailedImages(prev => ({ ...prev, [game.id]: true }))} />
                                        ) : (
                                            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-2xl border border-gold-400/15 bg-gold-400/[.04] text-3xl font-black text-gold-300/50">{game.shortName}</div>
                                        )}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#02030a]/25 via-transparent to-white/[.015]" />
                                        <div className="absolute right-2.5 top-2.5 flex h-8 w-8 -translate-y-1 items-center justify-center rounded-full border border-gold-400/30 bg-black/70 text-gold-300 opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <ExternalLink size={14} />
                                        </div>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 flex h-[38px] items-center justify-center border-t border-white/[.05] bg-[#03040a]/95 px-2 backdrop-blur-md">
                                        <p className="truncate text-[11px] font-black uppercase tracking-[.03em] text-white">{game.name}</p>
                                    </div>

                                    <div className="pointer-events-none absolute inset-[3px] rounded-[13px] border border-[#efb72f]/0 transition group-hover:border-[#efb72f]/20" />
                                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#ffd25d] to-transparent opacity-0 transition group-hover:opacity-100" />
                                </a>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default GamesSection