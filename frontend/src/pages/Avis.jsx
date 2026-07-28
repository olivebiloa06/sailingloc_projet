import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import StaticPage from "../components/StaticPage";

function Stars({ note }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 20 20" className={`h-4 w-4 ${s <= note ? "text-sable" : "text-gray-200"}`} fill="currentColor">
          <path d="M10 1.5 L12.5 7 L18.5 7.7 L14 11.8 L15.2 18 L10 14.8 L4.8 18 L6 11.8 L1.5 7.7 L7.5 7 Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Avis() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    api.get("/admin/reviews")
      .then((res) => {
        const r = res.data.reviews || [];
        setReviews(r);
        if (r.length > 0) {
          const avg = r.reduce((s, x) => s + x.note, 0) / r.length;
          setStats({ avg: Math.round(avg * 10) / 10, count: r.length });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <StaticPage
      title="Avis de la communauté"
      subtitle="Ce que pensent vraiment les locataires et propriétaires SailingLoc."
    >
      {!loading && stats.count > 0 && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-center">
            <p className="font-heading text-4xl font-bold text-navy">{stats.avg}</p>
            <Stars note={Math.round(stats.avg)} />
            <p className="mt-1 text-xs text-gray-400">{stats.count} avis vérifiés</p>
          </div>
          <div className="h-16 w-px bg-gray-100" />
          <p className="text-sm text-gray-600">
            Tous nos avis proviennent de locataires ayant effectué une vraie réservation confirmée sur SailingLoc. Aucun avis anonyme ou non vérifié n'est publié.
          </p>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Chargement des avis...</p>}

      {!loading && reviews.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-400">Les premiers avis arrivent bientôt !</p>
          <Link to="/boats" className="mt-4 inline-block text-sm font-medium text-sky">
            Réserve ton premier bateau →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-navy to-sky text-xs font-bold text-white">
                  {r.User?.prenom?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-navy">
                  {r.User?.prenom} {r.User?.nom?.[0]}.
                </span>
              </div>
              <Stars note={r.note} />
            </div>
            {r.Boat && (
              <p className="mt-1 text-xs text-sky">
                <Link to={`/boats/${r.Boat.id}`}>{r.Boat.nom}</Link>
              </p>
            )}
            {r.commentaire && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{r.commentaire}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
