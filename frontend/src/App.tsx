import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import AdminLayout from "./components/admin/layout/AdminLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute"
import ScrollToTop from "./components/common/ScrollToTop"

import AdminDashboard from "./pages/admin/AdminDashboard"
import Users from "./pages/admin/Users"
import Recharge from "./pages/admin/Recharge";
import Wallet from "./pages/admin/Wallet";
import Transactions from "./pages/admin/Transactions";
import GamesList from "./pages/Games/GamesList";
import CreateGame from "./pages/Games/CreateGame";
import EditGame from "./pages/Games/EditGame";
import GameDetails from "./pages/Games/GameDetails";

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"

import ProfilePage from "./pages/profile/ProfilePage"

import LandingPage from "./pages/public/LandingPage"
import PrivacyPage from "./pages/public/PrivacyPage"
import ResponsibleGamingPage from "./pages/public/ResponsibleGamingPage"
import SupportPage from "./pages/public/SupportPage"
import TermsPage from "./pages/public/TermsPage"

import AdminRoute from "./routes/AdminRoute"


const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/terms"
          element={<TermsPage />}
        />

        <Route
          path="/privacy"
          element={<PrivacyPage />}
        />

        <Route
          path="/responsible-gaming"
          element={<ResponsibleGamingPage />}
        />

        <Route
          path="/support"
          element={<SupportPage />}
        />

        <Route
          path="/admin"
          element={<AdminRoute />}
        >
          <Route element={<AdminLayout />}>
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="users"
              element={<Users />}
            />

            <Route
              path="recharge"
              element={<Recharge />}
            />
            <Route
              path="wallet"
              element={<Wallet />}
            />
            <Route
              path="transactions"
              element={<Transactions />}
            />
            <Route
              path="games"
              element={<GamesList />}
            />

            <Route
              path="games/create"
              element={<CreateGame />}
            />

            <Route
              path="games/:gameId"
              element={<GameDetails />}
            />

            <Route
              path="games/:gameId/edit"
              element={<EditGame />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App