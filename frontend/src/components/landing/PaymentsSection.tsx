import {
  BadgeCheck,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react"

interface PaymentMethod {
  name: string
  logo: string
  type: string
  logoClass?: string
}

const methods: PaymentMethod[] = [
  {
    name: "Cash App",
    logo: "https://cdn.simpleicons.org/cashapp",
    type: "Digital Wallet",
  },
  {
    name: "PayPal",
    logo: "https://cdn.simpleicons.org/paypal",
    type: "Digital Wallet",
  },
  {
    name: "Apple Pay",
    logo: "https://cdn.simpleicons.org/applepay",
    type: "Mobile Payment",
    logoClass: "max-h-[30px]",
  },
  {
    name: "Google Pay",
    logo: "https://cdn.simpleicons.org/googlepay",
    type: "Mobile Payment",
    logoClass: "max-h-[30px]",
  },
  {
    name: "Bitcoin",
    logo: "https://cdn.simpleicons.org/bitcoin",
    type: "Cryptocurrency",
  },
  {
    name: "Chime",
    logo: "https://images.seeklogo.com/logo-png/33/1/chime-logo-png_seeklogo-337387.png",
    type: "Online Banking",
  },
  {
    name: "Razorpay",
    logo: "https://cdn.simpleicons.org/razorpay",
    type: "Payment Gateway",
  },
]

const PaymentsSection = () => {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-y
        border-white/[0.07]
        bg-[#060812]
        py-20
      "
    >
      {/* =====================================
          AMBIENT BACKGROUND
      ====================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-1/2
          h-[450px]
          w-[450px]
          -translate-y-1/2
          rounded-full
          bg-[#d99b18]/[0.05]
          blur-[130px]
        "
      />

      <div
        className="
          pointer-events-none
          -right-32
          absolute
          top-1/2
          h-[500px]
          w-[500px]
          -translate-y-1/2
          rounded-full
          bg-purple-700/[0.07]
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-40
          w-[850px]
          -translate-x-1/2
          bg-[radial-gradient(circle,rgba(255,184,0,.05),transparent_70%)]
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
        {/* =====================================
            MAIN CONTENT
        ====================================== */}

        <div
          className="
            grid
            gap-12
            lg:grid-cols-[0.72fr_1.28fr]
            lg:items-center
          "
        >
          {/* =====================================
              LEFT
          ====================================== */}

          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gold-400/20
                  bg-gold-400/[0.06]
                  text-gold-400
                  shadow-[0_0_25px_rgba(255,184,0,.05)]
                "
              >
                <WalletCards size={22} />
              </div>

              <p
                className="
                  text-xs
                  font-black
                  tracking-[0.3em]
                  text-gold-400
                "
              >
                PAY YOUR WAY
              </p>
            </div>

            <h2
              className="
                mt-5
                text-3xl
                font-black
                leading-tight
                text-white
                md:text-4xl
                lg:text-[42px]
              "
            >
              Flexible payment
              <br className="hidden lg:block" /> options
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                leading-7
                text-white/45
              "
            >
              Choose from available payment methods to purchase Golden
              Credits and continue your GoldenSweep experience.
            </p>

            {/* TRUST BADGES */}

            <div
              className="
                mt-7
                flex
                flex-wrap
                gap-3
              "
            >
              <TrustBadge
                icon={<ShieldCheck size={16} />}
                text="Secure Processing"
              />

              <TrustBadge
                icon={<Zap size={16} />}
                text="Fast Credit Flow"
              />

              <TrustBadge
                icon={<BadgeCheck size={16} />}
                text="Verified Methods"
              />
            </div>

            {/* INFO */}

            <div
              className="
                mt-8
                rounded-2xl
                border
                border-gold-400/10
                bg-gold-400/[0.025]
                p-5
              "
            >
              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={20}
                  className="
                    mt-0.5
                    shrink-0
                    text-gold-400
                  "
                />

                <div>
                  <p className="text-sm font-black text-white">
                    Payments verified before credit
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-xs
                      leading-5
                      text-white/40
                    "
                  >
                    Credits are issued only after the selected payment
                    method has been successfully verified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================
              PAYMENT METHODS
          ====================================== */}

          <div
            className="
              grid
              gap-2.5
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {methods.map((method) => (
              <PaymentMethodCard
                key={method.name}
                method={method}
              />
            ))}

            {/* MORE METHODS */}

            <div
              className="
                group
                relative
                flex
                min-h-[86px]
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                border-dashed
                border-gold-400/20
                bg-gold-400/[0.015]
                transition
                duration-300
                hover:border-gold-400/40
                hover:bg-gold-400/[0.035]
              "
            >
              <div className="text-center">
                <Sparkles
                  size={20}
                  className="
                    mx-auto
                    text-gold-400
                  "
                />

                <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-gold-300">
                  MORE METHODS
                </p>

                <p className="mt-1 text-[9px] text-white/30">
                  Admin configurable
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            LOWER FEATURE PANEL
        ====================================== */}

        <div
          className="
            mt-12
            grid
            overflow-hidden
            rounded-[22px]
            border
            border-white/[0.07]

            bg-[linear-gradient(
              135deg,
              #070912,
              #08070d_45%,
              #080711
            )]

            md:grid-cols-3
          "
        >
          <PaymentFeature
            icon={<CreditCard size={22} />}
            title="Choose your method"
            text="Select from the payment options currently enabled for your GoldenSweep account."
          />

          <PaymentFeature
            icon={<LockKeyhole size={22} />}
            title="Secure verification"
            text="Payment activity is verified before credits are issued to your wallet."
          />

          <PaymentFeature
            icon={<Smartphone size={22} />}
            title="Designed for every screen"
            text="A simple and consistent payment experience across desktop and mobile."
            last
          />
        </div>

        {/* =====================================
            BOTTOM STATUS STRIP
        ====================================== */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-4

            rounded-2xl

            border
            border-gold-400/15

            bg-[linear-gradient(
              90deg,
              rgba(255,184,0,.025),
              rgba(138,43,226,.025)
            )]

            px-5
            py-4

            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gold-400/[0.06]
                text-gold-400
              "
            >
              <Sparkles size={18} />
            </div>

            <p
              className="
                text-sm
                font-semibold
                text-white/60
              "
            >
              Payment availability can be managed dynamically by
              GoldenSweep administrators.
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-black
              tracking-[0.1em]
              text-gold-300
            "
          >
            <ShieldCheck size={17} />

            PAYMENT READY
          </div>
        </div>
      </div>
    </section>
  )
}

/* =====================================
  PAYMENT METHOD CARD
===================================== */

const PaymentMethodCard = ({
  method,
}: {
  method: PaymentMethod
}) => {
  return (
    <div
      className="
        group
        relative
        min-h-[86px]
        overflow-hidden
        rounded-[16px]
        border
        border-white/[0.08]
        bg-[linear-gradient(145deg,rgba(255,255,255,.03),rgba(255,255,255,.01))]
        px-4
        py-3

        transition
        duration-300

        hover:-translate-y-0.5
        hover:border-gold-400/30
        hover:bg-gold-400/[0.025]
        hover:shadow-[0_12px_28px_rgba(0,0,0,.28)]
      "
    >
      {/* top gold glow */}
      <div
        className="
          absolute
          inset-x-7
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-gold-400/60
          to-transparent
          opacity-0
          transition
          duration-300
          group-hover:opacity-100
        "
      />

      <div className="flex h-full items-center gap-3.5">

        {/* LOGO BOX */}
        <div
          className="
            flex
            h-[52px]
            w-[68px]
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-[11px]
            border
            border-white/[0.08]
            bg-white
            px-2.5
            py-2
            shadow-[0_4px_14px_rgba(0,0,0,.16)]
          "
        >
          <img
            src={method.logo}
            alt={`${method.name} logo`}
            loading="lazy"
            className={`
              block
              max-h-[32px]
              w-auto
              max-w-[58px]
              object-contain
              ${method.logoClass ?? ""}
            `}
            onError={(event) => {
              event.currentTarget.style.display = "none"
            }}
          />
        </div>

        {/* DETAILS */}
        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-[14px]
              font-black
              leading-none
              text-white
            "
          >
            {method.name}
          </p>

          <p
            className="
              mt-2
              truncate
              text-[10.5px]
              text-white/35
            "
          >
            {method.type}
          </p>

          <div
            className="
              mt-2
              flex
              items-center
              gap-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.09em]
              text-[#d5a62e]
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#e6b334]
                shadow-[0_0_6px_rgba(255,190,40,.35)]
              "
            />

            Available
          </div>
        </div>
      </div>
    </div>
  )
}

/* =====================================
  TRUST BADGE
===================================== */

interface TrustBadgeProps {
  icon: React.ReactNode
  text: string
}

const TrustBadge = ({
  icon,
  text,
}: TrustBadgeProps) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2

        rounded-full

        border
        border-white/[0.07]

        bg-white/[0.02]

        px-3
        py-2

        text-xs
        font-semibold
        text-white/55
      "
    >
      <span className="text-gold-400">
        {icon}
      </span>

      {text}
    </div>
  )
}

/* =====================================
   PAYMENT FEATURE
===================================== */

interface PaymentFeatureProps {
  icon: React.ReactNode
  title: string
  text: string
  last?: boolean
}

const PaymentFeature = ({
  icon,
  title,
  text,
  last = false,
}: PaymentFeatureProps) => {
  return (
    <div
      className={`
        relative
        p-7

        ${!last
          ? "md:border-r md:border-white/[0.07]"
          : ""
        }
      `}
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-xl

          border
          border-gold-400/15

          bg-gold-400/[0.05]

          text-gold-400
        "
      >
        {icon}
      </div>

      <h3 className="mt-4 font-black text-white">
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-white/40
        "
      >
        {text}
      </p>
    </div>
  )
}

export default PaymentsSection