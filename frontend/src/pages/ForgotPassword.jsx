import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Entre ton adresse email."); return; }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link to="/" className="font-heading text-2xl font-semibold">SailingLoc</Link>
        <div>
          <h1 className="font-heading text-4xl font-semibold leading-tight">
            Mot de passe<br />oublié ?
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Pas de panique — on t'envoie un lien pour le réinitialiser en toute sécurité.
          </p>
        </div>
        <p className="text-sm text-white/50">© 2026 SailingLoc — Agence Pandawan</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="font-heading text-2xl font-semibold text-navy">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <Link to="/login" className="font-medium text-sky hover:underline">
              ← Retour à la connexion
            </Link>
          </p>

          {submitted ? (
            <div className="mt-8 rounded-xl bg-green-50 px-5 py-6 text-center">
              <p className="text-3xl">📧</p>
              <p className="mt-3 font-heading text-base font-semibold text-navy">
                Email envoyé !
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Si un compte correspond à <strong>{email}</strong>, tu vas recevoir
                un lien de réinitialisation valable <strong>1 heure</strong>.
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Vérifie aussi tes spams.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
              >
                {loading ? "Envoi en cours..." : "Recevoir le lien de réinitialisation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
