import {
  Clock3,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  BadgeCheck,
  Zap,
  Shield,
  Headset,
} from "lucide-react"

const items = [
  {
    icon: LockKeyhole,
    number: "01",
    title: "Secure by design",
    text: "Protected account, transaction, and session flows built around secure platform experiences.",
    tag: "Account Protection",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Transparent ledger",
    text: "Clear payment, credit, and recharge records so every transaction remains easy to understand.",
    tag: "Clear Records",
  },
  {
    icon: Clock3,
    number: "03",
    title: "Fast processing",
    text: "Streamlined workflows designed for efficient payment processing and game recharge requests.",
    tag: "Quick Processing",
  },
  {
    icon: Headphones,
    number: "04",
    title: "Support ready",
    text: "Support tools designed to help players quickly whenever account or recharge assistance is needed.",
    tag: "Player Support",
  },
]

const trustStrip = [
  {
    icon: LockKeyhole,
    title: "100% Secure",
    text: "Your data is safe",
  },
  {
    icon: Zap,
    title: "Fast Payments",
    text: "Quick & reliable",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    text: "We're always here",
  },
  {
    icon: Shield,
    title: "Fair & Transparent",
    text: "Built for players",
  },
]

const TrustSection = () => {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#03040a]
        py-20
        md:py-24
      "
    >
      {/* Background atmosphere */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[380px]
          w-[900px]
          -translate-x-1/2
          rounded-full
          bg-gold-400/[0.035]
          blur-[120px]
        "
      />

      <div className="relative mx-auto max-w-[1500px] px-5 lg:px-10">

        {/* SECTION HEADING */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-400/70" />

            <p
              className="
                text-[11px]
                font-black
                uppercase
                tracking-[0.32em]
                text-gold-400
              "
            >
              BUILT ON TRUST
            </p>

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-400/70" />
          </div>

          <h2
            className="
              mt-4
              text-3xl
              font-black
              tracking-tight
              text-white
              md:text-4xl
              lg:text-[42px]
            "
          >
            Play with confidence.
            <span className="text-gold-400"> Stay golden.</span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-white/45
              md:text-base
            "
          >
            GoldenSweep is designed around secure experiences, transparent
            records, efficient processing, and dependable player support.
          </p>
        </div>

        {/* TRUST CARDS */}
        <div
          className="
            mt-12
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {items.map(
            ({ icon: Icon, number, title, text, tag }) => (
              <article
                key={title}
                className="
                  group
                  relative
                  min-h-[285px]
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-white/[0.08]
                  bg-[linear-gradient(145deg,rgba(255,255,255,.025),rgba(255,184,0,.015),rgba(255,255,255,.01))]
                  p-6

                  transition-all
                  duration-500

                  hover:-translate-y-1
                  hover:border-gold-400/35
                  hover:shadow-[0_18px_50px_rgba(0,0,0,.35),0_0_35px_rgba(255,184,0,.035)]
                "
              >
                {/* Hover glow */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-16
                    -top-16
                    h-44
                    w-44
                    rounded-full
                    bg-gold-400/[0.07]
                    blur-[60px]

                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                {/* Big background number */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    right-5
                    top-3
                    text-[58px]
                    font-black
                    leading-none
                    text-white/[0.025]
                  "
                >
                  {number}
                </span>

                {/* Icon */}
                <div
                  className="
                    relative
                    flex
                    h-[58px]
                    w-[58px]
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-gold-400/20
                    bg-[radial-gradient(circle,rgba(255,184,0,.12),rgba(255,184,0,.035))]
                    shadow-[inset_0_0_20px_rgba(255,184,0,.03)]
                  "
                >
                  <Icon
                    size={25}
                    strokeWidth={1.8}
                    className="text-gold-400"
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      rounded-2xl
                      shadow-[0_0_22px_rgba(255,184,0,.08)]
                    "
                  />
                </div>

                {/* Content */}
                <h3
                  className="
                    mt-6
                    text-[18px]
                    font-black
                    text-white
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-3
                    text-[13px]
                    leading-6
                    text-white/42
                  "
                >
                  {text}
                </p>

                {/* Bottom label */}
                <div
                  className="
                    absolute
                    bottom-6
                    left-6
                    flex
                    items-center
                    gap-2
                  "
                >
                  <BadgeCheck
                    size={14}
                    className="text-gold-400"
                  />

                  <span
                    className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-gold-300/75
                    "
                  >
                    {tag}
                  </span>
                </div>

                {/* bottom hover line */}
                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    h-px
                    w-0
                    -translate-x-1/2
                    bg-gradient-to-r
                    from-transparent
                    via-gold-400
                    to-transparent

                    transition-all
                    duration-500
                    group-hover:w-3/4
                  "
                />
              </article>
            )
          )}
        </div>

        {/* LOWER TRUST BAR */}
        <div
          className="
            relative
            mt-10
            overflow-hidden
            rounded-[20px]
            border
            border-gold-400/15
            bg-[linear-gradient(90deg,rgba(255,184,0,.035),rgba(255,255,255,.015),rgba(138,43,226,.025),rgba(255,184,0,.035))]
            px-5
            py-5
            md:px-7
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-0
              h-px
              w-1/2
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-gold-400/50
              to-transparent
            "
          />

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-0
            "
          >
            {trustStrip.map(
              ({ icon: Icon, title, text }, index) => (
                <div
                  key={title}
                  className={`
                    flex
                    items-center
                    gap-3
                    px-3
                    lg:px-6

                    ${
                      index !== 0
                        ? "lg:border-l lg:border-white/[0.07]"
                        : ""
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gold-400/[0.07]
                    "
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.9}
                      className="text-gold-400"
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-[11px]
                        font-black
                        uppercase
                        tracking-[0.06em]
                        text-white
                      "
                    >
                      {title}
                    </p>

                    <p className="mt-1 text-[10px] text-white/35">
                      {text}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* FINAL MICRO COPY */}
        <div
          className="
            mt-7
            flex
            items-center
            justify-center
            gap-2
            text-center
          "
        >
          <ShieldCheck
            size={14}
            className="text-gold-400/70"
          />

          <p className="text-[11px] text-white/30">
            Security, transparency and reliable support at every step of your
            GoldenSweep experience.
          </p>
        </div>
      </div>
    </section>
  )
}

export default TrustSection