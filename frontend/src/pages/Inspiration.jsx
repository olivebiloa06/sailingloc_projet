import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Reveal from "../components/Reveal";
import { usePageMeta } from "../hooks/usePageMeta";

const CATEGORIES = ["Tous", "Actualités nautiques", "Guide de voyage", "Conseils de navigation", "Destination tendance"];
const CATEGORY_COLORS = {
  "Actualités nautiques": "bg-sky/10 text-sky",
  "Guide de voyage": "bg-green-50 text-green-700",
  "Conseils de navigation": "bg-amber-50 text-amber-700",
  "Destination tendance": "bg-orange-50 text-orange-700",
};
const GRADIENTS = ["from-navy to-sky", "from-sky to-navy", "from-navy to-abysse", "from-abysse to-sky", "from-sky to-abysse", "from-navy to-sky"];
const DESTINATIONS_TENDANCE = [
  { label: "Corse", query: "Corse", emoji: "🏖️" },
  { label: "Croatie", query: "Croatie", emoji: "⛵" },
  { label: "Côte d'Azur", query: "Côte d'Azur", emoji: "☀️" },
  { label: "Morbihan", query: "Morbihan", emoji: "🌊" },
  { label: "Baléares", query: "Baléares", emoji: "🏝" },
  { label: "Marseille", query: "Marseille", emoji: "🪸" },
];

function ArticleModal({ article, gradient, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className={`h-36 rounded-t-2xl bg-gradient-to-br ${gradient} flex items-end p-5`}>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[article.categorie] || "bg-white/20 text-white"}`}>
            {article.categorie}
          </span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>⏱ {article.tempsLecture} de lecture</span>
          </div>
          <h2 className="mt-3 font-heading text-xl font-semibold leading-snug text-navy">{article.titre}</h2>
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-gray-600 whitespace-pre-line">{article.contenu}</div>
          <div className="mt-6 flex gap-3">
            <Link to={article.lienBoats || "/boats"} onClick={onClose}
              className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light">
              Voir les bateaux →
            </Link>
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-navy hover:text-navy">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Inspiration() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [openArticle, setOpenArticle] = useState(null);
  const [openGradient, setOpenGradient] = useState("");

  // SEO
  usePageMeta({ title: "Inspiration", description: "Actualités nautiques, guides de voyage et destinations tendance.", url: "/inspiration" });

  useEffect(() => {
    api.get("/articles")
      .then((res) => setArticles(res.data.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "Tous" ? articles : articles.filter((a) => a.categorie === activeCategory);
  const openModal = (article, idx) => { setOpenArticle(article); setOpenGradient(GRADIENTS[idx % GRADIENTS.length]); };

  return (
    <div className="bg-cloud">
      {openArticle && <ArticleModal article={openArticle} gradient={openGradient} onClose={() => setOpenArticle(null)} />}

      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/70">Inspiration</span>
            <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">Actualités & guides<br />de la mer.</h1>
            <p className="mt-4 text-lg text-white/70">Actualités nautiques, guides de destinations, conseils pratiques — tout ce dont tu as besoin pour préparer ta prochaine aventure.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal><p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Destinations tendance</p></Reveal>
          <Reveal delay={80} className="mt-3 flex flex-wrap gap-2">
            {DESTINATIONS_TENDANCE.map((d) => (
              <Link key={d.label} to={`/boats?localisation=${encodeURIComponent(d.query)}`}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-cloud px-3 py-1.5 text-sm font-medium text-navy transition hover:border-navy hover:bg-navy hover:text-white">
                <span>{d.emoji}</span>{d.label}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sticky top-0 z-10 border-b border-gray-200 bg-white py-3 shadow-sm">
        <div className="mx-auto max-w-5xl overflow-x-auto px-6">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${activeCategory === cat ? "bg-navy text-white" : "bg-cloud text-gray-600 hover:bg-gray-200"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          {loading && <p className="text-sm text-gray-500">Chargement des articles...</p>}
          {!loading && filtered.length === 0 && <p className="text-sm text-gray-500">Aucun article dans cette catégorie pour l'instant.</p>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article, i) => (
              <Reveal key={article.id} delay={i * 60}>
                <button type="button" onClick={() => openModal(article, i)}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className={`h-28 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-end p-4`}>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[article.categorie] || "bg-white/20 text-white"}`}>{article.categorie}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs text-gray-400">{new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <h3 className="mt-1 font-heading text-sm font-semibold leading-snug text-navy">{article.titre}</h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-gray-500 line-clamp-3">{article.extrait}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">⏱ {article.tempsLecture}</span>
                      <span className="text-xs font-semibold text-sky opacity-0 transition group-hover:opacity-100">Lire la suite →</span>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-14 text-white">
        <Reveal>
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-heading text-2xl font-semibold">Prêt à partir ?</h2>
            <p className="mt-3 text-white/70">Trouve le bateau qui correspond à ton prochain voyage.</p>
            <Link to="/boats" className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-navy transition hover:bg-cloud">Explorer les bateaux disponibles</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
