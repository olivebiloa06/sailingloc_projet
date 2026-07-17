import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function FavoriteButton({ boatId, className = "" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/favorites/check/${boatId}`)
      .then(({ data }) => setLiked(data.liked))
      .catch(() => {});
  }, [boatId, user]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/favorites/toggle", { boatId });
      setLiked(data.liked);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`flex items-center justify-center rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm transition hover:scale-110 disabled:opacity-50 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition ${liked ? "fill-red-500 text-red-500" : "fill-none text-gray-500 hover:text-red-400"}`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
