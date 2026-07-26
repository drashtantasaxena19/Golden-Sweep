import { Activity, ShieldCheck } from "lucide-react"

const AdminFooter = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-white/[0.07] bg-[#05070d] px-5 py-4 lg:px-8">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-3 text-[10px] text-white/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p>
                        © {currentYear} GoldenSweep. All rights reserved.
                    </p>

                    <span className="hidden h-3 w-px bg-white/10 sm:block" />

                    <p className="flex items-center gap-1.5">
                        <ShieldCheck
                            size={13}
                            className="text-[#d9a82f]"
                        />

                        Secure administration console
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <p className="flex items-center gap-1.5 text-emerald-300/70">
                        <Activity size={12} />

                        System Operational
                    </p>

                    <p>
                        Version 1.0.0
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default AdminFooter