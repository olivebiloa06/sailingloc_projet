import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isValidEmail } from "../utils/validators";
import { usePageMeta } from "../hooks/usePageMeta";
import PasswordInput from "../components/PasswordInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import AuthSidePanel from "../components/AuthSidePanel";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ""}` : "/";

  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // SEO
  usePageMeta({ title: "Connexion", url: "/login" });

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
      setServerError(err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthSidePanel
        title={<>Explore le vent<br />autrement.</>}
        text="Connecte-toi pour réserver un bateau, suivre tes réservations ou gérer tes annonces si tu es propriétaire."
      />

      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 block text-center font-heading text-2xl font-semibold text-navy lg:hidden">SailingLoc</Link>

          <div className="rounded-2xl bg-white p-7 shadow-[0_2px_20px_rgba(10,42,67,0.08)] sm:p-8 lg:shadow-[0_10px_35px_-10px_rgba(10,42,67,0.18)]">
            <h2 className="font-heading text-2xl font-semibold text-navy">Connexion</h2>
            <p className="mt-1 text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-medium text-sky hover:underline">Inscris-toi</Link>
            </p>

            <div className="mt-8">
              <GoogleLoginButton
                onSuccess={() => navigate(redirectTo, { replace: true })}
                onError={setServerError}
              />
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {serverError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
              )}
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">Adresse email</label>
                <input id="email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="motDePasse" className="mb-1 block text-sm font-medium text-navy">Mot de passe</label>
                <Link to="/forgot-password" className="float-right text-xs text-sky hover:underline">Mot de passe oublié ?</Link>
                <PasswordInput id="motDePasse" name="motDePasse" autoComplete="current-password"
                  value={form.motDePasse} onChange={handleChange} />
                {errors.motDePasse && <p className="mt-1 text-xs text-red-600">{errors.motDePasse}</p>}
              </div>
              <button type="submit" disabled={submitting}
                className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60">
                {submitting ? "Connexion..." : "Se connecter"}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4.5" y="10.5" width="15" height="9" rx="2" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
                Connexion sécurisée
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
