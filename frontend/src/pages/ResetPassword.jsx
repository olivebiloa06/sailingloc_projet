import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { getPasswordStrengthError } from "../utils/validators";
import PasswordInput from "../components/PasswordInput";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ motDePasse: "", confirmation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const strengthError = getPasswordStrengthError(form.motDePasse);
    if (strengthError) { setError(strengthError); return; }
    if (form.motDePasse !== form.confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Lien invalide. Fais une nouvelle demande.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, motDePasse: form.motDePasse });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
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
            Nouveau<br />mot de passe.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Choisis un mot de passe sécurisé pour protéger ton compte.
          </p>
        </div>
        <p className="text-sm text-white/50">© 2026 SailingLoc — Agence Pandawan</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="font-heading text-2xl font-semibold text-navy">
            Choisir un nouveau mot de passe
          </h2>

          {success ? (
            <div className="mt-8 rounded-xl bg-green-50 px-5 py-6 text-center">
              <p className="text-3xl">✅</p>
              <p className="mt-3 font-heading text-base font-semibold text-navy">
                Mot de passe mis à jour !
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Tu vas être redirigé vers la connexion dans quelques secondes...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              {!token && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  Lien invalide ou expiré.{" "}
                  <Link to="/forgot-password" className="font-medium underline">
                    Faire une nouvelle demande
                  </Link>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-navy">
                  Nouveau mot de passe
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={form.motDePasse}
                  onChange={(e) => setForm((p) => ({ ...p, motDePasse: e.target.value }))}
                />
                <p className="mt-1 text-xs text-gray-400">
                  8 caractères minimum, une majuscule, un chiffre.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-navy">
                  Confirmer le mot de passe
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={form.confirmation}
                  onChange={(e) => setForm((p) => ({ ...p, confirmation: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
              >
                {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
