import {
  ChevronDown,
  CircleHelp,
  Headphones,
  MessageCircleMore,
  ShieldQuestion,
} from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    q: "What are Golden Credits?",
    a: "Golden Credits are platform credits used within the GoldenSweep experience. Conversion rules and packages are configured by the platform.",
  },
  {
    q: "How do game recharges work?",
    a: "Select a supported game, enter the requested player details, choose a recharge amount, and submit the request. Processing method depends on the provider configuration.",
  },
  {
    q: "How long does a game recharge take?",
    a: "Recharge time depends on the selected provider and processing mode. Manual requests may require verification before completion, while future API-connected providers can process faster.",
  },
  {
    q: "Can I use Golden Credits across different games?",
    a: "Golden Credits belong to your GoldenSweep wallet. You can use available credits to request recharges for supported games, subject to provider limits and platform rules.",
  },
  {
    q: "What happens if my recharge fails?",
    a: "If a recharge cannot be completed, the held credits should be released back to your available wallet balance after the request is marked failed or rejected.",
  },
  {
    q: "Can I change my payment method later?",
    a: "Yes. You can use any payment method currently enabled for your account and region. Available methods may change based on platform configuration and merchant eligibility.",
  },
  {
    q: "Where can I see my payment and recharge history?",
    a: "Your account keeps a record of wallet activity, payment requests, credit transactions, and game recharge requests so you can review past activity from one place.",
  },
]

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#050711]
        py-24
      "
    >
      {/* AMBIENT BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          left-[-100px]
          top-[20%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-gold-400/[0.04]
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-120px]
          top-[15%]
          h-[500px]
          w-[500px]
          rounded-full
          bg-purple-700/[0.06]
          blur-[140px]
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-[1400px]
          px-5
          lg:px-10
        "
      >
        {/* HEADER */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-400/70" />

            <p
              className="
                text-[11px]
                font-black
                uppercase
                tracking-[0.3em]
                text-gold-400
              "
            >
              NEED TO KNOW
            </p>

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-400/70" />
          </div>

          <h2
            className="
              mt-4
              text-3xl
              font-black
              text-white
              md:text-4xl
              lg:text-[42px]
            "
          >
            Frequently asked questions
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
            Quick answers about how the GoldenSweep experience works.
          </p>
        </div>

        {/* MAIN GRID */}
        <div
          className="
            mt-12
            grid
            gap-6
            lg:grid-cols-[0.72fr_1.28fr]
          "
        >
          {/* LEFT HELP PANEL */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-gold-400/20
              bg-[linear-gradient(145deg,#0a0b12,#0b0812_55%,#08090e)]
              p-7
              shadow-[0_20px_50px_rgba(0,0,0,.3)]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-16
                h-48
                w-48
                rounded-full
                bg-gold-400/[0.08]
                blur-[65px]
              "
            />

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-gold-400/20
                bg-gold-400/[0.06]
                text-gold-400
              "
            >
              <ShieldQuestion size={27} />
            </div>

            <p
              className="
                mt-7
                text-[11px]
                font-black
                uppercase
                tracking-[0.22em]
                text-gold-300
              "
            >
              GOLDENSWEEP HELP
            </p>

            <h3
              className="
                mt-2
                text-2xl
                font-black
                text-white
              "
            >
              Questions before you start?
            </h3>

            <p
              className="
                mt-4
                leading-7
                text-white/42
              "
            >
              Learn how credits, payments, recharges, and supported gaming
              platforms work before continuing.
            </p>

            {/* HELP POINTS */}
            <div className="mt-8 space-y-4">
              <HelpPoint
                icon={<CircleHelp size={18} />}
                title="Simple answers"
                text="Clear explanations for common player questions."
              />

              <HelpPoint
                icon={<MessageCircleMore size={18} />}
                title="Quick guidance"
                text="Understand the platform before making a payment or recharge."
              />

              <HelpPoint
                icon={<Headphones size={18} />}
                title="Support available"
                text="Reach out when you need additional help."
              />
            </div>

            {/* SUPPORT CTA */}
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-white/[0.07]
                bg-black/20
                p-5
              "
            >
              <p className="text-sm font-black text-white">
                Still need help?
              </p>

              <p className="mt-1.5 text-xs leading-5 text-white/38">
                Contact GoldenSweep support for account, payment, or recharge
                assistance.
              </p>

              <button
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gold-400/25
                  bg-gold-400/[0.04]
                  px-4
                  py-2.5
                  text-xs
                  font-black
                  text-gold-300
                  transition
                  hover:bg-gold-400
                  hover:text-black
                "
              >
                <Headphones size={16} />
                CONTACT SUPPORT
              </button>
            </div>
          </div>

          {/* FAQ ACCORDION */}
          <div className="space-y-3">
            {faqs.map((item, index) => {
              const isOpen = open === index

              return (
                <div
                  key={item.q}
                  className={`
                    overflow-hidden
                    rounded-[18px]
                    border
                    transition-all
                    duration-300

                    ${
                      isOpen
                        ? `
                          border-gold-400/30
                          bg-[linear-gradient(145deg,rgba(255,184,0,.045),rgba(255,255,255,.015))]
                          shadow-[0_10px_30px_rgba(0,0,0,.2)]
                        `
                        : `
                          border-white/[0.08]
                          bg-white/[0.02]
                          hover:border-gold-400/20
                        `
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpen(isOpen ? null : index)
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-5
                      px-5
                      py-5
                      text-left
                    "
                  >
                    <div className="flex items-center gap-4">
                      {/* NUMBER */}
                      <span
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-[11px]
                          font-black

                          ${
                            isOpen
                              ? "bg-gold-400 text-black"
                              : "border border-gold-400/15 bg-gold-400/[0.05] text-gold-300"
                          }
                        `}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className="
                          text-[15px]
                          font-black
                          text-white
                          md:text-base
                        "
                      >
                        {item.q}
                      </span>
                    </div>

                    <div
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full

                        transition
                        duration-300

                        ${
                          isOpen
                            ? "bg-gold-400/[0.1]"
                            : "bg-white/[0.025]"
                        }
                      `}
                    >
                      <ChevronDown
                        size={19}
                        className={`
                          transition-transform
                          duration-300

                          ${
                            isOpen
                              ? "rotate-180 text-gold-400"
                              : "text-white/35"
                          }
                        `}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className="
                        px-5
                        pb-6
                        pl-[68px]
                        pr-10
                      "
                    >
                      <div
                        className="
                          h-px
                          w-full
                          bg-gradient-to-r
                          from-gold-400/15
                          via-white/[0.05]
                          to-transparent
                        "
                      />

                      <p
                        className="
                          mt-4
                          max-w-3xl
                          text-sm
                          leading-7
                          text-white/48
                        "
                      >
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* BOTTOM QUICK HELP STRIP */}
        <div
          className="
            mt-8
            grid
            overflow-hidden
            rounded-[20px]
            border
            border-white/[0.07]
            bg-[#070912]
            sm:grid-cols-3
          "
        >
          <QuickHelp
            title="Payments"
            text="Learn how available payment methods work."
          />

          <QuickHelp
            title="Golden Credits"
            text="Understand credit conversion and wallet usage."
          />

          <QuickHelp
            title="Game Recharge"
            text="See how game recharge requests are processed."
            last
          />
        </div>
      </div>
    </section>
  )
}

interface HelpPointProps {
  icon: React.ReactNode
  title: string
  text: string
}

const HelpPoint = ({
  icon,
  title,
  text,
}: HelpPointProps) => (
  <div className="flex items-start gap-3">
    <div
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-gold-400/[0.06]
        text-gold-400
      "
    >
      {icon}
    </div>

    <div>
      <p className="text-sm font-black text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-white/38">
        {text}
      </p>
    </div>
  </div>
)

interface QuickHelpProps {
  title: string
  text: string
  last?: boolean
}

const QuickHelp = ({
  title,
  text,
  last = false,
}: QuickHelpProps) => (
  <div
    className={`
      p-5

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
        font-black
        uppercase
        tracking-[0.13em]
        text-gold-300
      "
    >
      {title}
    </p>

    <p className="mt-2 text-xs leading-5 text-white/38">
      {text}
    </p>
  </div>
)

export default FAQSection