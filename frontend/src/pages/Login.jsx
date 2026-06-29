import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isValidEmail } from "../utils/validators";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // On reconstruit pathname + search (pas juste pathname) : sinon, un
  // utilisateur redirigé depuis /boats?localisation=Corse perdrait son
  // filtre après connexion et retomberait sur /boats tout court.
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ""}` : "/";

  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!isValidEmail(form.email)) next.email = "Adresse email invalide.";
    if (!form.motDePasse) next.motDePasse = "Le mot de passe est requis.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(form.email, form.motDePasse);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Panneau de marque — visible à partir des écrans larges */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link to="/" className="font-heading text-2xl font-semibold">
          SailingLoc
        </Link>
        <div>
          <h1 className="font-heading text-4xl font-semibold leading-tight">
            Explore le vent
            <br />
            autrement.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Connecte-toi pour réserver un bateau, suivre tes réservations ou
            gérer tes annonces si tu es propriétaire.
          </p>
        </div>
        <p className="text-sm text-white/50">
          © 2026 SailingLoc — Agence Pandawan
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 block font-heading text-2xl font-semibold text-navy lg:hidden"
          >
            SailingLoc
          </Link>

          <h2 className="font-heading text-2xl font-semibold text-navy">
            Connexion
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-medium text-sky hover:underline">
              Inscris-toi
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-navy"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="motDePasse"
                className="mb-1 block text-sm font-medium text-navy"
              >
                Mot de passe
              </label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                autoComplete="current-password"
                value={form.motDePasse}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.motDePasse && (
                <p className="mt-1 text-xs text-red-600">{errors.motDePasse}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
