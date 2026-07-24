import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import Footer from "../layout/Footer"
import Navbar from "../layout/Navbar"

interface LegalSection {
    number: string
    title: string
    content: React.ReactNode
}

interface LegalPageLayoutProps {
    eyebrow: string
    title: string
    description: string
    updated: string
    sections: LegalSection[]
}

const LegalPageLayout = ({
    eyebrow,
    title,
    description,
    updated,
    sections,
}: LegalPageLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#03050d] text-white">
            <Navbar />

            <main className="relative overflow-hidden pt-[80px]">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[550px] w-[1000px] -translate-x-1/2 rounded-full bg-gold-400/[0.045] blur-[150px]" />

                <section className="relative px-5 pb-20 pt-14 lg:px-10">
                    <div className="mx-auto max-w-[1220px]">
                        <div className="mb-5">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 rounded-xl border border-gold-400/20 bg-gold-400/[0.03] px-4 py-2.5 text-sm font-bold text-gold-300 transition hover:border-gold-400/40 hover:bg-gold-400/[0.07]"
                            >
                                <ArrowLeft size={17} />
                                Back to GoldenSweep
                            </Link>
                        </div>

                        <div className="relative overflow-hidden rounded-[30px] border border-gold-400/20 bg-[linear-gradient(145deg,rgba(255,184,0,.055),rgba(255,255,255,.015),rgba(138,43,226,.035))] px-6 py-12 text-center shadow-[0_30px_80px_rgba(0,0,0,.35)] md:px-12">
                            <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gold-400/[0.08] blur-[90px]" />

                            <div className="relative">
                                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-gold-400">
                                    {eyebrow}
                                </p>

                                <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                                    {title}
                                </h1>

                                <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/48 md:text-lg">
                                    {description}
                                </p>

                                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-4 py-2.5 text-xs text-white/42">
                                    <ShieldCheck size={15} className="text-gold-400" />
                                    Last updated: {updated}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#070a13] shadow-[0_25px_70px_rgba(0,0,0,.25)]">
                            {sections.map((section, index) => (
                                <section
                                    key={section.number}
                                    className={`relative px-6 py-10 md:px-11 ${index !== sections.length - 1
                                            ? "border-b border-white/[0.07]"
                                            : ""
                                        }`}
                                >
                                    <div className="pointer-events-none absolute right-8 top-7 text-[64px] font-black leading-none text-white/[0.025]">
                                        {section.number}
                                    </div>

                                    <p className="text-[10px] font-black tracking-[0.22em] text-gold-400">
                                        {section.number}
                                    </p>

                                    <h2 className="mt-3 max-w-4xl text-2xl font-black text-white md:text-3xl">
                                        {section.title}
                                    </h2>

                                    <div className="mt-5 max-w-5xl space-y-4 text-sm leading-7 text-white/55 md:text-base">
                                        {section.content}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <div className="mt-8 rounded-[22px] border border-gold-400/15 bg-[linear-gradient(90deg,rgba(255,184,0,.03),rgba(138,43,226,.025))] px-6 py-5">
                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    size={19}
                                    className="mt-0.5 shrink-0 text-gold-400"
                                />

                                <p className="text-sm leading-6 text-white/42">
                                    These policies form part of the GoldenSweep platform framework.
                                    Final production terms, jurisdiction restrictions, registered
                                    company details, support contacts and payment-provider
                                    disclosures should be reviewed and completed before public launch.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default LegalPageLayout