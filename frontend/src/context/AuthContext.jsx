import { createContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken, refreshSession } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app, on tente un refresh silencieux : si le cookie
  // HttpOnly posé par le backend est encore valide, on récupère un nouvel
  // access token ET le profil utilisateur en un seul appel, sans que
  // l'utilisateur ait à se reconnecter à chaque rechargement de page.
    const restoreSession = useCallback(async () => {
    try {
      const { data } = await refreshSession();
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email, motDePasse) => {
    const { data } = await api.post("/auth/login", { email, motDePasse });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ nom, prenom, email, motDePasse, role }) => {
    const { data } = await api.post("/auth/register", {
      nom,
      prenom,
      email,
      motDePasse,
      role,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      // Révoque le refresh token côté serveur et efface le cookie. Si
      // l'appel échoue (ex: déjà expiré), on nettoie quand même l'état local.
      await api.post("/auth/logout");
    } catch {
      // pas bloquant
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
