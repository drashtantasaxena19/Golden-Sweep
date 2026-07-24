import LegalPageLayout from "../../components/legal/LegalPageLayout"

const PrivacyPage = () => (
    <LegalPageLayout
        eyebrow="PRIVACY & DATA"
        title="Privacy Policy"
        description="This policy explains what information GoldenSweep may collect, why it is used, when it may be shared, and the choices available to users."
        updated="July 24, 2026"
        sections={[
            {
                number: "01",
                title: "Information we collect",
                content: <>
                    <p>We may collect account details, contact information, authentication records, age and location information, payment and transaction metadata, recharge requests, support communications, device information, security logs, and platform usage data.</p>
                    <p>Payment card credentials should be handled by approved payment processors rather than stored directly by GoldenSweep unless a compliant architecture has been independently implemented.</p>
                </>
            },
            {
                number: "02",
                title: "How information is used",
                content: <>
                    <p>Information may be used to create and secure accounts, process transactions, maintain wallet records, complete recharge requests, prevent fraud, provide support, improve platform performance, comply with legal obligations, and enforce platform rules.</p>
                </>
            },
            {
                number: "03",
                title: "Sharing of information",
                content: <>
                    <p>Information may be shared with payment processors, authentication providers, infrastructure vendors, fraud-prevention providers, supported game providers where necessary to fulfill user requests, professional advisers, or government authorities where legally required.</p>
                    <p>GoldenSweep should not sell sensitive personal information without legally required disclosure and consent.</p>
                </>
            },
            {
                number: "04",
                title: "Cookies and analytics",
                content: <>
                    <p>GoldenSweep may use essential cookies, session storage, security technologies, preferences, and analytics tools. Non-essential tracking should be handled according to applicable consent requirements.</p>
                </>
            },
            {
                number: "05",
                title: "Data security",
                content: <>
                    <p>Reasonable administrative, technical, and organizational safeguards should be used to protect personal information. No online service can guarantee absolute security.</p>
                </>
            },
            {
                number: "06",
                title: "Data retention",
                content: <>
                    <p>Records should be retained only as long as reasonably required for account operation, transaction history, fraud prevention, dispute handling, legal compliance, accounting, and security purposes.</p>
                </>
            },
            {
                number: "07",
                title: "User rights",
                content: <>
                    <p>Depending on your state or jurisdiction, you may have rights to request access, correction, deletion, portability, or information about certain uses of personal data.</p>
                    <p>Identity verification may be required before fulfilling privacy requests.</p>
                </>
            },
            {
                number: "08",
                title: "Children",
                content: <>
                    <p>GoldenSweep is intended only for adults aged 18 or older. The platform should not knowingly collect information from children for participation in gaming or payment activities.</p>
                </>
            },
            {
                number: "09",
                title: "Policy changes and contact",
                content: <>
                    <p>This policy may be updated as the platform, vendors, laws, or data practices change.</p>
                    <p>Verified privacy contact details and the legal operating entity must be inserted before production launch.</p>
                </>
            }
        ]}
    />
)

export default PrivacyPage