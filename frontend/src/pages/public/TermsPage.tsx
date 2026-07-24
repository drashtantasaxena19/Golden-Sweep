import LegalPageLayout from "../../components/legal/LegalPageLayout"

const TermsPage = () => (
    <LegalPageLayout
        eyebrow="GOLDENSWEEP LEGAL"
        title="Terms & Conditions"
        description="These Terms explain the rules governing GoldenSweep accounts, Golden Credits, payments, game recharge requests, promotions, third-party gaming services, and acceptable use."
        updated="July 24, 2026"
        sections={[
            {
                number: "01",
                title: "Agreement to these Terms",
                content: <>
                    <p>By creating an account, accessing GoldenSweep, purchasing or receiving Golden Credits, submitting a recharge request, or using any platform feature, you agree to these Terms and all policies incorporated into them.</p>
                    <p>If you do not agree, you must not use the platform.</p>
                </>
            },
            {
                number: "02",
                title: "Eligibility and location restrictions",
                content: <>
                    <p>You must be at least 18 years old and legally permitted to use the offered services in your location.</p>
                    <p>GoldenSweep may restrict accounts, payments, promotions, providers, or game access based on state, territory, payment-provider requirements, licensing, or other compliance obligations.</p>
                    <p>Users are responsible for providing accurate age, identity, and location information when requested.</p>
                </>
            },
            {
                number: "03",
                title: "GoldenSweep accounts",
                content: <>
                    <p>You are responsible for keeping your login credentials secure and for activity performed through your account.</p>
                    <p>You may not create accounts using false identity information, impersonate another person, bypass eligibility restrictions, abuse promotions, or use automated tools to manipulate platform activity.</p>
                    <p>GoldenSweep may suspend or restrict accounts where fraud, chargebacks, abuse, prohibited activity, or legal risk is reasonably suspected.</p>
                </>
            },
            {
                number: "04",
                title: "Golden Credits",
                content: <>
                    <p>Golden Credits are platform credits used to request supported services within GoldenSweep. Unless expressly stated otherwise in a separate legally approved program, Golden Credits are not bank deposits, securities, cryptocurrency, or stored cash balances.</p>
                    <p>Credit conversion rates, packages, promotional credits, expiration rules, limits, and permitted uses may be configured by GoldenSweep and displayed before purchase or use.</p>
                    <p>The current V1 platform does not provide cash withdrawal or cash redemption of Golden Credits.</p>
                </>
            },
            {
                number: "05",
                title: "Payments",
                content: <>
                    <p>Payment methods displayed on GoldenSweep are subject to merchant approval, processor availability, user eligibility, geography, and applicable provider policies.</p>
                    <p>A displayed payment logo does not guarantee that the method is enabled for every transaction or user.</p>
                    <p>Transactions may require verification before credits are issued. GoldenSweep may reject, delay, reverse, or investigate transactions affected by fraud indicators, chargebacks, duplicate payments, processor errors, or regulatory restrictions.</p>
                </>
            },
            {
                number: "06",
                title: "Game recharge requests",
                content: <>
                    <p>GoldenSweep may allow users to request transfer or allocation of eligible credits to supported third-party game accounts.</p>
                    <p>You must provide correct player identifiers and recharge information. GoldenSweep is not responsible for loss caused by incorrect information submitted by the user once an irreversible provider transaction has been completed.</p>
                    <p>Recharge processing times vary by provider and may be manual or automated.</p>
                </>
            },
            {
                number: "07",
                title: "Third-party gaming providers",
                content: <>
                    <p>GoldenSweep may link to or facilitate access to third-party gaming platforms. Unless expressly stated otherwise, those providers operate independently and are responsible for their own games, availability, rules, results, accounts, and technical systems.</p>
                    <p>Use of a third-party provider may also be subject to that provider's own terms and policies.</p>
                </>
            },
            {
                number: "08",
                title: "Promotions and rewards",
                content: <>
                    <p>Promotions may have separate eligibility rules, start and end dates, limits, exclusions, and bonus-credit conditions.</p>
                    <p>GoldenSweep may cancel promotional benefits obtained through duplicate accounts, automation, collusion, identity manipulation, payment abuse, or other misuse.</p>
                    <p>Any sweepstakes or prize promotion must be governed by separate official rules and applicable law before launch.</p>
                </>
            },
            {
                number: "09",
                title: "Prohibited conduct",
                content: <>
                    <p>You may not use GoldenSweep for fraud, money laundering, unauthorized payment activity, account selling, credential sharing, automated abuse, illegal gambling, sanctions evasion, intellectual-property infringement, harassment, or attempts to compromise platform security.</p>
                </>
            },
            {
                number: "10",
                title: "Refunds, reversals and failed transactions",
                content: <>
                    <p>Refund eligibility depends on transaction status, payment method, provider status, applicable law, and whether credits or recharge value have already been consumed or irreversibly transferred.</p>
                    <p>Failed or rejected recharge requests should not permanently deduct unused credits. Final ledger treatment must follow the transaction record and applicable refund policy.</p>
                </>
            },
            {
                number: "11",
                title: "Service availability",
                content: <>
                    <p>GoldenSweep does not guarantee uninterrupted access. Maintenance, provider outages, network failures, security events, legal restrictions, or payment-provider issues may temporarily affect services.</p>
                </>
            },
            {
                number: "12",
                title: "Intellectual property",
                content: <>
                    <p>GoldenSweep branding, interface designs, software, original artwork, content, and platform technology are protected by applicable intellectual-property laws.</p>
                    <p>Third-party names, trademarks, and game-provider assets remain the property of their respective owners.</p>
                </>
            },
            {
                number: "13",
                title: "Changes and termination",
                content: <>
                    <p>GoldenSweep may update these Terms where required for product, legal, security, or regulatory reasons. Material changes should be communicated through the platform where appropriate.</p>
                    <p>Accounts may be suspended or terminated for violations of these Terms or where continued service would create legal or security risk.</p>
                </>
            },
            {
                number: "14",
                title: "Contact",
                content: <>
                    <p>Legal and support contact details will be published before production launch.</p>
                    <p>Do not insert a fake support email or company address. Use the legally registered operating entity and verified contact information before release.</p>
                </>
            }
        ]}
    />
)

export default TermsPage