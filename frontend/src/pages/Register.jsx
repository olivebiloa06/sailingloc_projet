import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { isValidEmail, getPasswordStrengthError } from "../utils/validators";
import { usePageMeta } from "../hooks/usePageMeta";

// Documents obligatoires selon le rôle du compte créé.
// La validation se fait côté admin (pas automatiquement) — le compte existe
// dès la création, mais les annonces du propriétaire ne sont visibles qu'une
// fois ses documents validés (côté admin).
const OWNER_REQUIRED_DOCS = [
  { key: "piece_identite", label: "Pièce d'identité", hint: "Carte nationale d'identité ou passeport (PDF, JPG, PNG)" },
  { key: "assurance", label: "Assurance responsabilité civile", hint: "Document de moins de 3 mois (PDF)" },
];

function OwnerDocumentsStep({ onComplete }) {
  const [files, setFiles] = useState({ piece_identite: null, assurance: null });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const handleFile = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    OWNER_REQUIRED_DOCS.forEach(({ key, label }) => {
      if (!files[key]) next[key] = `${label} requis.`;
    });
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setUploading(true);
    setGlobalError("");

    try {
      for (const { key, label } of OWNER_REQUIRED_DOCS) {
        const formData = new FormData();
        formData.append("document", files[key]);
        formData.append("nom", label);
        formData.append("type", key);
        await api.post("/documents", formData);
      }
      onComplete();
    } catch (err) {
      setGlobalError(
        err.response?.data?.message ||
          "Erreur lors de l'envoi des documents. Réessaie."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link to="/" className="font-heading text-2xl font-semibold">SailingLoc</Link>
        <div>
          <h1 className="font-heading text-4xl font-semibold leading-tight">
            Dernière étape.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Pour sécuriser notre communauté, nous vérifions l'identité de chaque
            propriétaire avant la mise en ligne de ses annonces.
          </p>
        </div>
        <p className="text-sm text-white/50">© 2026 SailingLoc — Agence Pandawan</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="font-heading text-2xl font-semibold text-navy">
            Documents requis
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ces documents sont transmis à notre équipe pour validation. Ton
            compte est actif immédiatement, mais tes annonces seront visibles
            après validation (généralement sous 24h).
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {globalError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {globalError}
              </div>
            )}

            {OWNER_REQUIRED_DOCS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-navy">
                  {label}
                </label>
                <p className="mb-2 text-xs text-gray-400">{hint}</p>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => handleFile(key, e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600"
                />
                {errors[key] && (
                  <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60"
            >
              {uploading ? "Envoi en cours..." : "Envoyer les documents"}
            </button>

            <button
              type="button"
              onClick={onComplete}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
            >
              Passer pour l'instant (tu pourras les ajouter plus tard)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
  // Après la création d'un compte propriétaire, on passe à l'étape 2 (docs)
  const [showDocStep, setShowDocStep] = useState(false);

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
    if (form.confirmation !== form.motDePasse)
      next.confirmation = "Les mots de passe ne correspondent pas.";
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
      if (form.role === "proprietaire") {
        setShowDocStep(true);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (showDocStep) {
    return <OwnerDocumentsStep onComplete={() => navigate("/mon-compte", { replace: true })} />;
  }

    // SEO meta tags
    
  usePageMeta({ title: "Créer un compte", url: "/register" });

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link to="/" className="font-heading text-2xl font-semibold">SailingLoc</Link>
        <div>
          <h1 className="font-heading text-4xl font-semibold leading-tight">
            Rejoins l'aventure<br />en mer.
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Crée ton compte pour réserver ton prochain bateau, ou pour mettre
            le tien en location.
          </p>
        </div>
        <p className="text-sm text-white/50">© 2026 SailingLoc — Agence Pandawan</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-cloud px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 block font-heading text-2xl font-semibold text-navy lg:hidden">
            SailingLoc
          </Link>
          <h2 className="font-heading text-2xl font-semibold text-navy">Créer un compte</h2>
          <p className="mt-1 text-sm text-gray-500">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-medium text-sky hover:underline">Connecte-toi</Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
            )}

            <div>
              <span className="mb-1 block text-sm font-medium text-navy">Je m'inscris en tant que</span>
              <div className="grid grid-cols-2 gap-3">
                {["locataire", "proprietaire"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => selectRole(role)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      form.role === role
                        ? "border-navy bg-navy text-white"
                        : "border-gray-300 text-gray-600 hover:border-navy/40"
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
              {form.role === "proprietaire" && (
                <p className="mt-2 text-xs text-amber-600">
                  Des documents d'identité et d'assurance vous seront demandés à l'étape suivante.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["prenom", "nom"].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="mb-1 block text-sm font-medium text-navy">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    id={field}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
                  />
                  {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">Adresse email</label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="motDePasse" className="mb-1 block text-sm font-medium text-navy">Mot de passe</label>
              <input
                id="motDePasse" name="motDePasse" type="password" autoComplete="new-password"
                value={form.motDePasse} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.motDePasse && <p className="mt-1 text-xs text-red-600">{errors.motDePasse}</p>}
            </div>

            <div>
              <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-navy">Confirmer le mot de passe</label>
              <input
                id="confirmation" name="confirmation" type="password" autoComplete="new-password"
                value={form.confirmation} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/30"
              />
              {errors.confirmation && <p className="mt-1 text-xs text-red-600">{errors.confirmation}</p>}
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
