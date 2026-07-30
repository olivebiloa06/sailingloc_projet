import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "../layouts/Layout";
import { useAuth } from "../hooks/useAuth";

import Home from "../pages/Home";
import BoatList from "../pages/BoatList";
import BoatDetail from "../pages/BoatDetail";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Inspiration from "../pages/Inspiration";
import APropos from "../pages/APropos";
import Aide from "../pages/Aide";
import Avis from "../pages/Avis";
import Securite from "../pages/Securite";
import Assurance from "../pages/Assurance";
import RessourcesProprietaires from "../pages/RessourcesProprietaires";
import MentionsLegales from "../pages/MentionsLegales";
import Confidentialite from "../pages/Confidentialite";
import Cookies from "../pages/Cookies";
import Contact from "../pages/Contact";
import Messages from "../pages/Messages";
import Register from "../pages/Register";
import Account from "../pages/Account";
import MyBookings from "../pages/MyBookings";
import OwnerRequests from "../pages/OwnerRequests";
import AdminDocuments from "../pages/AdminDocuments";
import OwnerBoats from "../pages/OwnerBoats";
import BoatForm from "../pages/BoatForm";
import ManageAvailability from "../pages/ManageAvailability";
import Reservation from "../pages/Reservation";
import BookingSuccess from "../pages/BookingSuccess";
import BookingCancel from "../pages/BookingCancel";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import CookieConsent from "../components/CookieConsent";

// Page "principale" de chaque rôle une fois connecté — voir HomeGate.
const HOME_REDIRECT_BY_ROLE = {
  locataire: "/boats",
  proprietaire: "/mon-compte",
  admin: "/mon-compte",
};

// La landing page (marketing, "Explore la mer autrement") n'a de sens que
// pour un visiteur non connecté : un utilisateur déjà authentifié qui tape
// "/", clique sur le logo ou sur "Accueil" (header ou fil d'Ariane) est
// renvoyé directement vers sa page principale plutôt que d'y revoir la
// landing page. La seule façon d'y retourner est donc de se déconnecter.
function HomeGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-navy">
        Chargement...
      </div>
    );
  }

  if (user) {
    return <Navigate to={HOME_REDIRECT_BY_ROLE[user.role] || "/boats"} replace />;
  }

  return (
    <Layout>
      <Home />
    </Layout>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <CookieConsent />
      <Routes>
        <Route path="/" element={<HomeGate />} />
        <Route
          path="/boats"
          element={
            <Layout>
              <BoatList />
            </Layout>
          }
        />
        <Route
          path="/boats/:id"
          element={
            <Layout>
              <BoatDetail />
            </Layout>
          }
        />

        {/* Login/Register restent en plein écran, sans header/footer du site,
            pour garder le focus sur le formulaire. */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/inspiration" element={<Layout><Inspiration /></Layout>} />
        <Route path="/a-propos" element={<Layout><APropos /></Layout>} />
        <Route path="/aide" element={<Layout><Aide /></Layout>} />
        <Route path="/avis" element={<Layout><Avis /></Layout>} />
        <Route path="/securite" element={<Layout><Securite /></Layout>} />
        <Route path="/assurance" element={<Layout><Assurance /></Layout>} />
        <Route path="/ressources-proprietaires" element={<Layout><RessourcesProprietaires /></Layout>} />
        <Route path="/mentions-legales" element={<Layout><MentionsLegales /></Layout>} />
        <Route path="/confidentialite" element={<Layout><Confidentialite /></Layout>} />
        <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route
          path="/mes-messages"
          element={
            <ProtectedRoute>
              <Layout><Messages /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />

        <Route
          path="/mon-compte"
          element={
            <ProtectedRoute>
              <Layout>
                <Account />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-reservations"
          element={
            <ProtectedRoute>
              <Layout>
                <MyBookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/demandes"
          element={
            <ProtectedRoute roles={["proprietaire", "admin"]}>
              <Layout>
                <OwnerRequests />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Layout>
                <AdminDocuments />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-bateaux"
          element={
            <ProtectedRoute roles={["proprietaire", "admin"]}>
              <Layout>
                <OwnerBoats />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-bateaux/nouveau"
          element={
            <ProtectedRoute roles={["proprietaire", "admin"]}>
              <Layout>
                <BoatForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-bateaux/:id/edit"
          element={
            <ProtectedRoute roles={["proprietaire", "admin"]}>
              <Layout>
                <BoatForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mes-bateaux/:id/disponibilites"
          element={
            <ProtectedRoute roles={["proprietaire", "admin"]}>
              <Layout>
                <ManageAvailability />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Reservation />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Cibles de redirection Stripe (success_url / cancel_url) — pas de
            ProtectedRoute ici : après l'aller-retour sur checkout.stripe.com,
            la session se rétablit silencieusement via le cookie de refresh
            (voir AuthContext), pas besoin de bloquer l'affichage en attendant. */}
        <Route path="/booking/success" element={<Layout><BookingSuccess /></Layout>} />
        <Route path="/booking/cancel" element={<Layout><BookingCancel /></Layout>} />

        {/* Garde-fou : toute page pas encore construite (liens du footer,
            "À propos"...) affiche un message clair plutôt qu'un écran blanc. */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
