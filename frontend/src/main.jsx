import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { LanguageCurrencyProvider } from "./context/LanguageCurrencyContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageCurrencyProvider>
        <AppRoutes />
      </LanguageCurrencyProvider>
    </AuthProvider>
  </React.StrictMode>
);
