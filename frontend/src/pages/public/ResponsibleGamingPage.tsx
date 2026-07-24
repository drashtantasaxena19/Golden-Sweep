import LegalPageLayout from "../../components/legal/LegalPageLayout"

const ResponsibleGamingPage = () => (
    <LegalPageLayout
        eyebrow="PLAY RESPONSIBLY"
        title="Responsible Gaming"
        description="GoldenSweep is intended for adult entertainment. This page explains responsible-use principles, account safeguards, and available player controls."
        updated="July 24, 2026"
        sections={[
            {
                number: "01",
                title: "Adults only",
                content: <p>GoldenSweep is intended only for users aged 18 or older and may impose higher age requirements where local law requires them.</p>
            },
            {
                number: "02",
                title: "Play within your limits",
                content: <>
                    <p>Only spend amounts you can afford. Gaming should never be treated as a source of guaranteed income, investment, or solution to financial problems.</p>
                    <p>Do not chase losses or continue playing because of pressure, stress, or attempts to recover prior spending.</p>
                </>
            },
            {
                number: "03",
                title: "Player controls",
                content: <p>GoldenSweep should support configurable tools such as spending limits, recharge limits, cooling-off periods, account pauses, and self-exclusion where required or appropriate.</p>
            },
            {
                number: "04",
                title: "Signs of harmful play",
                content: <p>Warning signs may include spending beyond your means, hiding activity, borrowing money to play, neglecting responsibilities, or continuing despite negative consequences.</p>
            },
            {
                number: "05",
                title: "Self-exclusion and support",
                content: <p>Users should be able to contact support to request account restrictions or exclusion. Jurisdiction-specific responsible-gaming resources and helplines should be added before launch.</p>
            },
            {
                number: "06",
                title: "Promotions",
                content: <p>Promotional messaging should not imply guaranteed winnings, financial success, or pressure users to recover losses or continue excessive play.</p>
            }
        ]}
    />
)

export default ResponsibleGamingPage