// Page "principale" de chaque rôle une fois connecté — utilisée partout où
// un utilisateur déjà authentifié ne doit pas voir une page publique
// destinée aux visiteurs (landing page, /login, /register) : HomeGate,
// Login, Register.
const DEFAULT_REDIRECT_BY_ROLE = {
  locataire: "/boats",
  proprietaire: "/mon-compte",
  admin: "/mon-compte",
};

export function defaultRedirectFor(role) {
  return DEFAULT_REDIRECT_BY_ROLE[role] || "/boats";
}
