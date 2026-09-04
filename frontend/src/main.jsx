import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { LanguageCurrencyProvider } from "./context/LanguageCurrencyContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Tant que VITE_GOOGLE_CLIENT_ID n'est pas configuré (voir frontend/.env),
// on rend l'app sans le provider plutôt que de planter dessus — le bouton
// "Se connecter avec Google" (GoogleLoginButton) se masque lui-même dans ce
// cas, le reste du site continue de fonctionner normalement.
const app = (
  <AuthProvider>
    <LanguageCurrencyProvider>
      <AppRoutes />
    </LanguageCurrencyProvider>
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
