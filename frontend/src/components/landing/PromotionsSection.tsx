import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  Gift,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react"

import SectionHeading from "../common/SectionHeading"

const promotions = [
  {
    icon: Gift,
    title: "Welcome Bonus",
    headline: "Start with more",
    text: "Featured welcome offers can be configured and published by the GoldenSweep team.",
    badge: "NEW PLAYER",
    offer: "100%",
    offerLabel: "WELCOME BONUS",
    detail: "UP TO 500 GC",
    action: "CLAIM OFFER",
    accent: "gold",
  },
  {
    icon: CalendarDays,
    title: "Daily Rewards",
    headline: "Come back for more",
    text: "Run scheduled reward campaigns, loyalty promotions, and time-limited offers.",
    badge: "DAILY",
    offer: "7 DAYS",
    offerLabel: "REWARD STREAK",
    detail: "PLAY MORE • EARN MORE",
    action: "VIEW REWARDS",
    accent: "purple",
  },
  {
    icon: Sparkles,
    title: "Special Offers",
    headline: "Fresh promotions",
    text: "Highlight exclusive promotions and featured game campaigns from one place.",
    badge: "LIMITED",
    offer: "2X",
    offerLabel: "BONUS REWARDS",
    detail: "SELECTED GAME EVENTS",
    action: "EXPLORE OFFERS",
    accent: "gold",
  },
]

const PromotionsSection = () => (
  <section
    id="promotions"
    className="
      relative
      overflow-hidden
      bg-[#03040a]
      py-24
    "
  >
    {/* BACKGROUND ATMOSPHERE */}
    <div
      className="
        pointer-events-none
        absolute
        left-1/2
        top-0
        h-[500px]
        w-[900px]
        -translate-x-1/2
        rounded-full
        bg-[#d79817]/[0.035]
        blur-[130px]
      "
    />

    <div
      className="
        pointer-events-none
        absolute
        -right-40
        top-[30%]
        h-[500px]
        w-[500px]
        rounded-full
        bg-purple-700/[0.07]
        blur-[140px]
      "
    />

    <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
      <SectionHeading
        eyebrow="REWARDS & OFFERS"
        title="More reasons to stay golden"
        description="Flexible promotional experiences designed to keep the platform fresh and engaging."
      />

      {/* ============================================
          MAIN PROMOTION CARDS
      ============================================ */}
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {promotions.map(
          ({
            icon: Icon,
            title,
            headline,
            text,
            badge,
            offer,
            offerLabel,
            detail,
            action,
            accent,
          }) => (
            <article
              key={title}
              className="
                group
                relative
                min-h-[470px]
                overflow-hidden
                rounded-[24px]
                border
                border-gold-400/20
                bg-[linear-gradient(145deg,#0c0b0d_0%,#090a12_50%,#080711_100%)]
                p-7
                transition-all
                duration-500
                hover:-translate-y-1
                hover:border-gold-400/45
                hover:shadow-[0_25px_60px_rgba(0,0,0,.45)]
              "
            >
              {/* AMBIENT CARD GLOW */}
              <div
                className={`
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-64
                  w-64
                  rounded-full
                  blur-[80px]
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                  ${
                    accent === "purple"
                      ? "bg-purple-600/15"
                      : "bg-[#d99a18]/10"
                  }
                `}
              />

              {/* TOP SHINE */}
              <div
                className="
                  absolute
                  left-10
                  right-10
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-[#f4bd3d]/70
                  to-transparent
                "
              />

              {/* HEADER */}
              <div className="relative flex items-start justify-between">
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
                    bg-gradient-to-br
                    from-gold-400/15
                    to-transparent
                    text-gold-400
                    shadow-[0_0_25px_rgba(255,184,0,.06)]
                  "
                >
                  <Icon size={27} />
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-gold-400/20
                    bg-gold-400/[0.06]
                    px-3
                    py-1.5
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-gold-300
                  "
                >
                  {badge}
                </span>
              </div>

              {/* TITLE */}
              <div className="relative mt-7">
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.24em]
                    text-gold-300
                  "
                >
                  {title}
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {headline}
                </h3>

                <p className="mt-3 min-h-[84px] leading-7 text-white/45">
                  {text}
                </p>
              </div>

              {/* OFFER AREA */}
              <div
                className="
                  relative
                  mt-6
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-black/30
                  px-5
                  py-5
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    right-[-20px]
                    top-[-30px]
                    h-28
                    w-28
                    rounded-full
                    bg-gold-400/[0.07]
                    blur-[35px]
                  "
                />

                <div className="relative flex items-end justify-between gap-4">
                  <div>
                    <p
                      className="
                        bg-gradient-to-b
                        from-[#fff0a5]
                        via-[#ffc633]
                        to-[#b87508]
                        bg-clip-text
                        text-4xl
                        font-black
                        leading-none
                        text-transparent
                      "
                    >
                      {offer}
                    </p>

                    <p className="mt-2 text-xs font-black tracking-[0.08em] text-white">
                      {offerLabel}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-gold-300/75">
                      {detail}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-gold-400/20
                      bg-gold-400/[0.07]
                      text-gold-400
                    "
                  >
                    {title === "Welcome Bonus" && <Crown size={25} />}

                    {title === "Daily Rewards" && <CalendarDays size={25} />}

                    {title === "Special Offers" && <Zap size={25} />}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                className="
                  relative
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-gold-400/30
                  bg-gold-400/[0.04]
                  px-5
                  py-3.5
                  text-sm
                  font-black
                  text-gold-300
                  transition-all
                  duration-300
                  hover:bg-gold-400
                  hover:text-black
                  hover:shadow-[0_0_30px_rgba(255,184,0,.15)]
                "
              >
                {action}

                <ArrowRight
                  size={17}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </article>
          )
        )}
      </div>

      {/* ============================================
          GOLDEN REWARDS STRIP
      ============================================ */}
      <div
        className="
          relative
          mt-8
          overflow-hidden
          rounded-[24px]
          border
          border-gold-400/20
          bg-[linear-gradient(110deg,#09090e,#100b09_35%,#0c0813_70%,#08090e)]
          px-6
          py-7
          lg:px-9
        "
      >
        {/* BACKGROUND GLOW */}
        <div
          className="
            pointer-events-none
            absolute
            left-[20%]
            top-1/2
            h-36
            w-72
            -translate-y-1/2
            rounded-full
            bg-gold-400/[0.07]
            blur-[70px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-[10%]
            top-1/2
            h-36
            w-72
            -translate-y-1/2
            rounded-full
            bg-purple-600/[0.08]
            blur-[70px]
          "
        />

        <div
          className="
            relative
            grid
            gap-7
            md:grid-cols-[1.15fr_1fr_1fr]
            md:items-center
          "
        >
          {/* INTRO */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-gold-400/25
                bg-gold-400/[0.07]
                text-gold-400
              "
            >
              <Trophy size={26} />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-gold-300
                "
              >
                GOLDENSWEEP REWARDS
              </p>

              <h3 className="mt-1 text-xl font-black text-white">
                Every visit can feel more rewarding.
              </h3>
            </div>
          </div>

          {/* REWARD 1 */}
          <div
            className="
              flex
              items-center
              gap-4
              md:border-l
              md:border-white/[0.08]
              md:pl-7
            "
          >
            <Star
              size={24}
              className="shrink-0 text-gold-400"
            />

            <div>
              <p className="font-black text-white">
                Loyalty Rewards
              </p>

              <p className="mt-1 text-sm text-white/40">
                Return, play and discover new rewards.
              </p>
            </div>
          </div>

          {/* REWARD 2 */}
          <div
            className="
              flex
              items-center
              gap-4
              md:border-l
              md:border-white/[0.08]
              md:pl-7
            "
          >
            <Clock3
              size={24}
              className="shrink-0 text-gold-400"
            />

            <div>
              <p className="font-black text-white">
                Limited-Time Drops
              </p>

              <p className="mt-1 text-sm text-white/40">
                Watch for featured campaigns and bonuses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          BOTTOM BENEFIT ROW
      ============================================ */}
      <div
        className="
          mt-5
          grid
          gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <Benefit
          icon={<Gift size={19} />}
          title="Welcome Rewards"
          text="Special offers for eligible new players"
        />

        <Benefit
          icon={<CalendarDays size={19} />}
          title="Daily Campaigns"
          text="Fresh reasons to return regularly"
        />

        <Benefit
          icon={<Sparkles size={19} />}
          title="Featured Offers"
          text="Promotions across selected gaming worlds"
        />

        <Benefit
          icon={<CheckCircle2 size={19} />}
          title="Easy Access"
          text="Offers available directly from your account"
        />
      </div>
    </div>
  </section>
)

interface BenefitProps {
  icon: React.ReactNode
  title: string
  text: string
}

const Benefit = ({ icon, title, text }: BenefitProps) => (
  <div
    className="
      flex
      items-start
      gap-3
      rounded-2xl
      border
      border-white/[0.06]
      bg-white/[0.015]
      p-5
      transition
      duration-300
      hover:border-gold-400/20
      hover:bg-gold-400/[0.025]
    "
  >
    <div
      className="
        flex
        h-10
        w-10
        shrink-0
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

export default PromotionsSection