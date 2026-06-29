import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../layouts/Layout";

import Home from "../pages/Home";
import BoatList from "../pages/BoatList";
import BoatDetail from "../pages/BoatDetail";
import Login from "../pages/Login";
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

function AppRoutes() {
  return (
    <BrowserRouter>
      <CookieConsent />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
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
