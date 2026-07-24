import FAQSection from "../../components/landing/FAQSection"
import GamesSection from "../../components/landing/GamesSection"
import HeroSection from "../../components/landing/HeroSection"
import HowItWorks from "../../components/landing/HowItWorks"
import PaymentsSection from "../../components/landing/PaymentsSection"
import PromotionsSection from "../../components/landing/PromotionsSection"
import TrustSection from "../../components/landing/TrustSection"
import WalletPreview from "../../components/landing/WalletPreview"
import Footer from "../../components/layout/Footer"
import Navbar from "../../components/layout/Navbar"

const LandingPage = () => (
    <>
        <Navbar />
        <main>
            <HeroSection />
            <GamesSection />
            <HowItWorks />
            <WalletPreview />
            <PromotionsSection />
            <PaymentsSection />
            <TrustSection />
            <FAQSection />
        </main>
        <Footer />
    </>
)

export default LandingPage
