import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";

// Se masque tout seul tant que VITE_GOOGLE_CLIENT_ID n'est pas configuré
// (voir frontend/.env) — le reste du formulaire (email/mot de passe) reste
// utilisable normalement dans ce cas.
export default function GoogleLoginButton({ onSuccess, onError }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { loginWithGoogle } = useAuth();

  if (!googleClientId) return null;

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        {/* Le SDK Google n'accepte qu'une largeur en pixels (pas "100%" —
            provoquait un avertissement et un repli sur une largeur par
            défaut plus étroite que le reste du formulaire). 384 = la
            largeur du conteneur (max-w-sm) qui enveloppe tout le formulaire. */}
        <GoogleLogin
          locale="fr_FR"
          width="384"
          onSuccess={async (credentialResponse) => {
            try {
              const user = await loginWithGoogle(credentialResponse.credential);
              onSuccess?.(user);
            } catch (err) {
              onError?.(err.response?.data?.message || "Connexion Google impossible. Réessaie.");
            }
          }}
          onError={() => onError?.("Connexion Google impossible. Réessaie.")}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">OU</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}
