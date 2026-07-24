import LegalPageLayout from "../../components/legal/LegalPageLayout"

const SupportPage = () => (
    <LegalPageLayout
        eyebrow="PLAYER SUPPORT"
        title="GoldenSweep Support"
        description="Help with your account, payments, Golden Credits, recharge requests, security, and supported gaming platforms."
        updated="July 24, 2026"
        sections={[
            {
                number: "01",
                title: "Account help",
                content: <p>Contact support for login issues, account access, verification, profile updates, or suspected unauthorized activity.</p>
            },
            {
                number: "02",
                title: "Payment help",
                content: <p>For payment issues, keep your transaction reference, payment method, amount, date, and relevant screenshots available. Never send full card credentials or passwords through support messages.</p>
            },
            {
                number: "03",
                title: "Recharge help",
                content: <p>For delayed or failed recharge requests, provide the recharge reference, selected provider, player identifier, amount, and transaction status.</p>
            },
            {
                number: "04",
                title: "Security reports",
                content: <p>Report suspicious account activity, impersonation, phishing, credential theft, or unauthorized transactions immediately.</p>
            },
            {
                number: "05",
                title: "Contact channels",
                content: <p>Replace this section with verified GoldenSweep email, chat, WhatsApp, support hours, and legal entity information before production launch.</p>
            }
        ]}
    />
)

export default SupportPage