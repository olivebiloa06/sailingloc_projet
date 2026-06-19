import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isValidEmail, getPasswordStrengthError } from "../utils/validators";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Permet aux liens "Devenir propriétaire" (header, footer, accueil) de
  // pré-remplir le bon choix : /register?role=proprietaire
  const initialRole =
    searchParams.get("role") === "proprietaire" ? "proprietaire" : "locataire";

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    confirmation: "",
    role: initialRole,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const validate = () => {
    const next = {};
    if (!form.nom.trim()) next.nom = "Le nom est requis.";
    if (!form.prenom.trim()) next.prenom = "Le prénom est requis.";
    if (!isValidEmail(form.email)) next.email = "Adresse email invalide.";

    const passwordError = getPasswordStrengthError(form.motDePasse);
    if (passwordError) next.motDePasse = passwordError;

    if (form.confirmation !== form.motDePasse) {
      next.confirmation = "Les mots de passe ne correspondent pas.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse,
        role: form.role,
      });
      navigate("/", { replace: true });
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
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link to="/" className="font-heading text-2xl font-semibold">
          SailingLoc
        </Link>
        <div>
          <h1 className="font-heading text-4xl font-semibold leading-tight">
            Rejoins l'aventure
            <br />
            en mer.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Crée ton compte pour réserver ton prochain bateau, ou pour mettre
            le tien en location.
          </p>
        </div>
        <p className="text-sm text-white/50">
          © 2026 SailingLoc — Agence Pandawan
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 block font-heading text-2xl font-semibold text-navy lg:hidden"
          >
            SailingLoc
          </Link>

          <h2 className="font-heading text-2xl font-semibold text-navy">
            Créer un compte
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-medium text-sky hover:underline">
              Connecte-toi
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div>
              <span className="mb-1 block text-sm font-medium text-navy">
                Je m'inscris en tant que
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectRole("locataire")}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    form.role === "locataire"
                      ? "border-navy bg-navy text-white"
                      : "border-gray-300 text-gray-600 hover:border-navy/40"
                  }`}
                >
                  Locataire
                </button>
                <button
                  type="button"
                  onClick={() => selectRole("proprietaire")}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    form.role === "proprietaire"
                      ? "border-navy bg-navy text-white"
                      : "border-gray-300 text-gray-600 hover:border-navy/40"
                  }`}
                >
                  Propriétaire
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="prenom"
                  className="mb-1 block text-sm font-medium text-navy"
                >
                  Prénom
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                />
                {errors.prenom && (
                  <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="nom"
                  className="mb-1 block text-sm font-medium text-navy"
                >
                  Nom
                </label>
                <input
                  id="nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                />
                {errors.nom && (
                  <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                )}
              </div>
            </div>

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
                autoComplete="new-password"
                value={form.motDePasse}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.motDePasse && (
                <p className="mt-1 text-xs text-red-600">{errors.motDePasse}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmation"
                className="mb-1 block text-sm font-medium text-navy"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                value={form.confirmation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.confirmation && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmation}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
            >
              {submitting ? "Création du compte..." : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
