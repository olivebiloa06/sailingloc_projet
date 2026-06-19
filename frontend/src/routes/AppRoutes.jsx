import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../layouts/Layout";

import Home from "../pages/Home";
import BoatList from "../pages/BoatList";
import BoatDetail from "../pages/BoatDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Account from "../pages/Account";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/boats" element={<Layout><BoatList /></Layout>} />
        <Route path="/boats/:id" element={<Layout><BoatDetail /></Layout>} />

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

        {/* Garde-fou : toute page pas encore construite (liens du footer,
            "À propos"...) affiche un message clair plutôt qu'un écran blanc. */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
