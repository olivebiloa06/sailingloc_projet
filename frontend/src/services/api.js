import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 30000,
  // Indispensable pour que le cookie HttpOnly du refresh token soit envoyé
  // et reçu : sans ça, /auth/refresh et /auth/logout ne voient jamais le
  // cookie (même en local, localhost:5173 et localhost:5000 sont deux
  // origines différentes pour le navigateur).
});

// L'access token n'est plus stocké en localStorage : il vit uniquement en
// mémoire (cette variable de module). À chaque rechargement de page, on le
// récupère via /auth/refresh grâce au cookie HttpOnly (inaccessible en JS,
// donc inaccessible à un éventuel script malveillant en cas de XSS).
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Ouvre le fichier (PDF de contrat/document) renvoyé par un endpoint de type
// GET /.../:id/file dans un onglet déjà ouvert (voir appelants : l'onglet
// doit être ouvert AVANT l'appel réseau pour ne pas être bloqué en popup).
// L'endpoint répond soit par une URL JSON signée (Cloudinary, en prod), soit
// par les octets bruts du PDF (fichier local, en dev) — on ne peut pas
// deviner lequel à l'avance, donc on récupère toujours en blob et on
// distingue les deux cas via le type MIME du blob.
export async function openFileInNewTab(tab, url, params) {
  const { data } = await api.get(url, { params, responseType: "blob" });
  if (data.type && data.type.includes("json")) {
    const { url: fileUrl } = JSON.parse(await data.text());
    if (tab) tab.location.href = fileUrl;
  } else {
    if (tab) tab.location.href = URL.createObjectURL(data);
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Évite de déclencher plusieurs appels /auth/refresh en parallèle si
// plusieurs requêtes échouent en même temps (ex: deux appels API lancés en
// même temps juste après l'expiration de l'access token).
let refreshPromise = null;

function isAuthEndpoint(url = "") {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Si l'access token a expiré (401) sur une route qui n'est pas elle-même
    // une route d'auth, on tente UNE fois un refresh silencieux via le
    // cookie, puis on rejoue la requête originale avec le nouveau token.
    if (response?.status === 401 && config && !isAuthEndpoint(config.url) && !config._retried) {
      config._retried = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }

        const { data } = await refreshPromise;
        setAccessToken(data.accessToken);
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(config);
      } catch {
        // Le refresh a échoué : on efface juste le token en mémoire. Pas de
        // redirection forcée ici — un 401 sur un appel secondaire ne doit pas
        // éjecter un visiteur d'une page publique. C'est ProtectedRoute qui
        // renvoie vers /login pour les pages qui l'exigent réellement.
        setAccessToken(null);
      }
    }

    return Promise.reject(error);
  }
);

export default api;