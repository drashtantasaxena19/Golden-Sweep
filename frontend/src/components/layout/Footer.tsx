import { ShieldCheck } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import logoHorizontal from "../../assets/branding/logo_horizontal.png"

const Footer = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const goToSection = (sectionId: string) => {
    const scroll = () => {
      const element = document.getElementById(sectionId)
      if (!element) return

      const navbarOffset = 108
      const top =
        element.getBoundingClientRect().top +
        window.scrollY -
        navbarOffset

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      })
    }

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`)

      window.setTimeout(() => {
        scroll()
      }, 150)

      return
    }

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`
    )

    scroll()
  }

  return (
    <footer
      id="support"
      className="relative overflow-hidden border-t border-white/[0.08] bg-[#020309]"
    >
      <div className="pointer-events-none absolute left-[-120px] top-[20%] h-[320px] w-[320px] rounded-full bg-gold-400/[0.04] blur-[110px]" />
      <div className="pointer-events-none absolute right-[-120px] top-[10%] h-[360px] w-[360px] rounded-full bg-purple-700/[0.05] blur-[120px]" />

      <div className="relative mx-auto grid max-w-[1450px] gap-10 px-5 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-10">

        <div className="relative z-0 lg:col-span-2">
          <div className="pointer-events-none flex h-[125px] w-[420px] max-w-full items-center justify-start sm:h-[140px] sm:w-[500px] lg:h-[175px] lg:w-[650px]">
            <img
              src={logoHorizontal}
              alt="GoldenSweep"
              className="pointer-events-none h-80 w-full origin-left scale-[1.4] object-contain object-left"
            />
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/40">
            A premium multi-game credit and recharge experience built around
            one GoldenSweep account.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-400/15 bg-gold-400/[0.03] px-4 py-2 text-xs font-semibold text-white/55">
            <ShieldCheck
              size={16}
              className="text-gold-400"
            />
            Secure • Transparent • Player First
          </div>

          <div className="mt-6 flex items-center gap-3">
            <SocialBrandIcon
              src="https://cdn.simpleicons.org/instagram/E4405F"
              label="Instagram"
            />
            <SocialBrandIcon
              src="https://cdn.simpleicons.org/facebook/1877F2"
              label="Facebook"
            />
            <SocialBrandIcon
              src="https://cdn.simpleicons.org/whatsapp/25D366"
              label="WhatsApp"
            />
            <SocialBrandIcon
              src="https://cdn.simpleicons.org/gmail/EA4335"
              label="Email"
            />
          </div>
        </div>

        <div className="relative z-20">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">
            Explore
          </h3>

          <div className="mt-5 flex flex-col items-start gap-3 text-sm text-white/45">
            <button
              type="button"
              onClick={() => goToSection("home")}
              className="cursor-pointer transition duration-200 hover:translate-x-1 hover:text-gold-300"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => goToSection("games")}
              className="cursor-pointer transition duration-200 hover:translate-x-1 hover:text-gold-300"
            >
              Games
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection("how-it-works")
              }
              className="cursor-pointer transition duration-200 hover:translate-x-1 hover:text-gold-300"
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection("promotions")
              }
              className="cursor-pointer transition duration-200 hover:translate-x-1 hover:text-gold-300"
            >
              Promotions
            </button>
          </div>
        </div>

        <div className="relative z-20">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">
            Legal & Support
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-white/45">
            <RouteLink to="/terms">
              Terms & Conditions
            </RouteLink>

            <RouteLink to="/privacy">
              Privacy Policy
            </RouteLink>

            <RouteLink to="/responsible-gaming">
              Responsible Gaming
            </RouteLink>

            <RouteLink to="/support">
              Support
            </RouteLink>
          </div>
        </div>
      </div>

      <div className="relative z-20 border-t border-white/[0.07] px-5 py-4">
        <div className="mx-auto flex max-w-[1450px] flex-col gap-3 text-center text-xs text-white/30 md:flex-row md:items-center md:justify-between md:text-left">
          <p>
            © 2026 GoldenSweep. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-end">
            <span>18+ Only</span>

            <Link
              to="/responsible-gaming"
              className="transition hover:text-gold-300"
            >
              Responsible Play
            </Link>

            <span>Secure Payments</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const RouteLink = ({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) => (
  <Link
    to={to}
    className="w-fit cursor-pointer transition duration-200 hover:translate-x-1 hover:text-gold-300"
  >
    {children}
  </Link>
)

const SocialBrandIcon = ({
  src,
  label,
  href = "#",
}: {
  src: string
  label: string
  href?: string
}) => (
  <a
    href={href}
    aria-label={label}
    target={href !== "#" ? "_blank" : undefined}
    rel={
      href !== "#"
        ? "noopener noreferrer"
        : undefined
    }
    className="group relative z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/35 hover:bg-white/[0.07]"
  >
    <img
      src={src}
      alt=""
      className="h-[21px] w-[21px] object-contain transition-transform duration-300 group-hover:scale-110"
    />
  </a>
)

export default Footer