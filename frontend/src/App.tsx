import { BrowserRouter, Route, Routes } from "react-router-dom"
import ScrollToTop from "./components/common/ScrollToTop"
import LandingPage from "./pages/public/LandingPage"
import PrivacyPage from "./pages/public/PrivacyPage"
import ResponsibleGamingPage from "./pages/public/ResponsibleGamingPage"
import SupportPage from "./pages/public/SupportPage"
import TermsPage from "./pages/public/TermsPage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/responsible-gaming" element={<ResponsibleGamingPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  </BrowserRouter>
)

export default App