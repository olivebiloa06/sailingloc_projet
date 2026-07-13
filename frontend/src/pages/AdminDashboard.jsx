import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const CATEGORIES = [
  "Actualités nautiques",
  "Guide de voyage",
  "Conseils de navigation",
  "Destination tendance",
];

const EMPTY_FORM = {
  titre: "",
  categorie: "Actualités nautiques",
  extrait: "",
  contenu: "",
  lienBoats: "/boats",
  tempsLecture: "5 min",
  publie: false,
};

function ArticlesPanel({ articles, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openNew = () => { setEditingArticle(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (a) => {
    setEditingArticle(a);
    setForm({
      titre: a.titre,
      categorie: a.categorie,
      extrait: a.extrait,
      contenu: a.contenu,
      lienBoats: a.lienBoats || "/boats",
      tempsLecture: a.tempsLecture || "5 min",
      publie: a.publie,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.titre || !form.extrait || !form.contenu) {
      setFormError("Titre, extrait et contenu sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      if (editingArticle) {
        await api.put(`/articles/${editingArticle.id}`, form);
      } else {
        await api.post("/articles", form);
      }
      setShowForm(false);
      onRefresh();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet article définitivement ?")) return;
    await api.delete(`/articles/${id}`);
    onRefresh();
  };

  const togglePublish = async (a) => {
    await api.put(`/articles/${a.id}`, { publie: !a.publie });
    onRefresh();
  };

  return (
    <div className="mt-6 space-y-4">
      {showForm ? (
        <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h3 className="font-heading text-base font-semibold text-navy">
            {editingArticle ? "Modifier l'article" : "Nouvel article"}
          </h3>
          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-navy">Titre</label>
              <input
                type="text"
                required
                value={form.titre}
                onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy">Catégorie</label>
              <select
                value={form.categorie}
                onChange={(e) => setForm((p) => ({ ...p, categorie: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy">Temps de lecture</label>
              <input
                type="text"
                value={form.tempsLecture}
                onChange={(e) => setForm((p) => ({ ...p, tempsLecture: e.target.value }))}
                placeholder="5 min"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-navy">Lien bateaux (filtre)</label>
              <input
                type="text"
                value={form.lienBoats}
                onChange={(e) => setForm((p) => ({ ...p, lienBoats: e.target.value }))}
                placeholder="/boats?localisation=Corse"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-navy">Extrait (résumé court)</label>
              <textarea
                required
                rows={2}
                value={form.extrait}
                onChange={(e) => setForm((p) => ({ ...p, extrait: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-navy">Contenu complet</label>
              <textarea
                required
                rows={8}
                value={form.contenu}
                onChange={(e) => setForm((p) => ({ ...p, contenu: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                placeholder="Écris le contenu de l'article ici..."
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.publie}
              onChange={(e) => setForm((p) => ({ ...p, publie: e.target.checked }))}
            />
            Publier immédiatement (visible sur la page Inspiration)
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-50">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          + Nouvel article
        </button>
      )}

      {articles.length === 0 && !showForm && (
        <p className="text-sm text-gray-500">Aucun article. Crée ton premier article ci-dessus.</p>
      )}

      <div className="space-y-3">
        {articles.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sky">{a.categorie}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.publie ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {a.publie ? "Publié" : "Brouillon"}
                </span>
              </div>
              <p className="mt-1 font-heading text-sm font-semibold text-navy">{a.titre}</p>
              <p className="mt-0.5 text-xs text-gray-400">⏱ {a.tempsLecture} · lien : {a.lienBoats}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => togglePublish(a)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${a.publie ? "border-amber-300 text-amber-600 hover:border-amber-400" : "border-green-300 text-green-600 hover:border-green-400"}`}>
                {a.publie ? "Dépublier" : "Publier"}
              </button>
              <button onClick={() => openEdit(a)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy">
                Modifier
              </button>
              <button onClick={() => handleDelete(a.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-400">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_LABELS_DOC = {
  en_attente: "En attente",
  valide: "Validé",
  refuse: "Refusé",
};

const DOC_TYPE_LABELS = {
  piece_identite: "Pièce d'identité",
  assurance: "Assurance",
  certificat_bateau: "Certificat bateau",
  permis: "Permis",
  autre: "Autre",
};

function formatDate(v) {
  return new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [articles, setArticles] = useState([]);
  const [tab, setTab] = useState("kpi");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/documents/admin/pending").catch(() => ({ data: { documents: [] } })),
      api.get("/admin/users").catch(() => ({ data: { users: [] } })),
      api.get("/admin/bookings").catch(() => ({ data: { bookings: [] } })),
      api.get("/admin/payments").catch(() => ({ data: { payments: [] } })),
      api.get("/admin/reviews").catch(() => ({ data: { reviews: [] } })),
      api.get("/articles/admin/all").catch(() => ({ data: { articles: [] } })),
    ]).then(([dRes, uRes, bRes, pRes, rRes, aRes]) => {
      setPendingDocs(dRes.data.documents || []);
      const allUsers = uRes.data.users || [];
      setUsers(allUsers);
      setPayments(pRes.data.payments || []);
      setReviews(rRes.data.reviews || []);
      setArticles(aRes.data.articles || []);

      const allBookings = bRes.data.bookings || [];
      const confirmed = allBookings.filter((b) => b.statut === "confirmee");
      const totalCA = confirmed.reduce((s, b) => s + b.montantTotal, 0);
      const totalCommission = confirmed.reduce((s, b) => s + b.commission, 0);

      setStats({
        totalUsers: allUsers.length,
        locataires: allUsers.filter((u) => u.role === "locataire").length,
        proprietaires: allUsers.filter((u) => u.role === "proprietaire").length,
        totalBookings: allBookings.length,
        confirmedBookings: confirmed.length,
        totalCA: totalCA.toFixed(0),
        totalCommission: totalCommission.toFixed(0),
        pendingDocs: (dRes.data.documents || []).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const validateDoc = async (id, statut) => {
    try {
      await api.patch(`/documents/${id}/validate`, { statutValidation: statut });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur.");
    }
  };

  const downloadDoc = async (id) => {
    try {
      const res = await api.get(`/documents/${id}/file`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      window.open(url, "_blank");
    } catch {
      alert("Fichier non disponible.");
    }
  };

  const changeRole = async (userId, newRole) => {
    if (!window.confirm(`Changer le rôle de cet utilisateur en "${newRole}" ?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du changement de rôle.");
    }
  };

  const handleLogout = async () => { await logout(); navigate("/", { replace: true }); };

  const TABS = [
    { key: "kpi", label: "Tableau de bord" },
    { key: "docs", label: `Documents${stats?.pendingDocs > 0 ? ` (${stats.pendingDocs})` : ""}` },
    { key: "articles", label: "Articles" },
    { key: "payments", label: "Transactions" },
    { key: "reviews", label: "Avis" },
    { key: "users", label: "Utilisateurs" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy">
            Administration SailingLoc
          </h1>
          <p className="mt-1 text-sm text-gray-500">Connecté en tant qu'admin · {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-navy">
          Se déconnecter
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-cloud p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-white text-navy shadow-sm" : "text-gray-500 hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-sm text-gray-500">Chargement...</p>}

      {/* Onglet KPIs */}
      {!loading && tab === "kpi" && stats && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Utilisateurs", value: stats.totalUsers, sub: `${stats.locataires} locataires · ${stats.proprietaires} propriétaires` },
              { label: "Réservations", value: stats.totalBookings, sub: `${stats.confirmedBookings} confirmées` },
              { label: "Chiffre d'affaires", value: `${stats.totalCA} €`, sub: "Transactions confirmées" },
              { label: "Commission (10%)", value: `${stats.totalCommission} €`, sub: "Revenus SailingLoc" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-500">{kpi.label}</p>
                <p className="mt-1 text-2xl font-semibold text-navy">{kpi.value}</p>
                <p className="mt-1 text-xs text-gray-400">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/mes-bateaux" className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-navy hover:border-sky hover:shadow-sm">
              Gérer les bateaux
              <span className="mt-1 block text-xs font-normal text-gray-400">Voir et modérer toutes les annonces</span>
            </Link>
            <Link to="/demandes" className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-navy hover:border-sky hover:shadow-sm">
              Toutes les réservations
              <span className="mt-1 block text-xs font-normal text-gray-400">Superviser et intervenir en cas de litige</span>
            </Link>
          </div>
        </div>
      )}

      {/* Onglet Documents */}
      {!loading && tab === "docs" && (
        <div className="mt-6 space-y-4">
          {pendingDocs.length === 0 && (
            <p className="text-sm text-gray-500">Aucun document en attente.</p>
          )}
          {pendingDocs.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading text-sm font-semibold text-navy">
                    {doc.nom} — {DOC_TYPE_LABELS[doc.type] || doc.type}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {doc.User?.prenom} {doc.User?.nom} · {doc.User?.email} · rôle : {doc.User?.role}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">Soumis le {formatDate(doc.createdAt)}</p>
                </div>
                <button onClick={() => downloadDoc(doc.id)} className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy">
                  Voir le fichier
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => validateDoc(doc.id, "valide")} className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                  Valider
                </button>
                <button onClick={() => validateDoc(doc.id, "refuse")} className="rounded-lg border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:border-red-500">
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onglet Articles */}
      {!loading && tab === "articles" && (
        <ArticlesPanel articles={articles} onRefresh={load} />
      )}

      {/* Onglet Transactions */}
      {!loading && tab === "payments" && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-cloud text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Locataire</th>
                <th className="px-4 py-3 text-left">Bateau</th>
                <th className="px-4 py-3 text-left">Méthode</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-gray-700">{p.Booking?.User?.prenom} {p.Booking?.User?.nom}</td>
                  <td className="px-4 py-3 text-gray-500">{p.Booking?.Boat?.nom}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.methode}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.statut === "paye" ? "bg-green-50 text-green-700" : p.statut === "rembourse" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                      {p.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-navy">{p.montant} €</td>
                  <td className="px-4 py-3 text-right text-gray-400">{p.Booking ? (p.Booking.commission || 0).toFixed(0) : "—"} €</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">Aucune transaction.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Onglet Avis — modération */}
      {!loading && tab === "reviews" && (
        <div className="mt-6 space-y-3">
          {reviews.length === 0 && <p className="text-sm text-gray-500">Aucun avis pour l'instant.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy">{r.User?.prenom} {r.User?.nom}</span>
                  <span className="text-xs text-gray-400">sur</span>
                  <span className="text-sm text-gray-600">{r.Boat?.nom}</span>
                  <span className="rounded-full bg-sable/20 px-2 py-0.5 text-xs font-semibold text-sable">★ {r.note}/5</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{r.commentaire}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("Supprimer cet avis ?")) return;
                  await api.delete(`/admin/reviews/${r.id}`);
                  load();
                }}
                className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-400"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Onglet Utilisateurs */}
      {!loading && tab === "users" && (
        <div className="mt-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cloud text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rôle actuel</th>
                  <th className="px-4 py-3 text-left">Inscription</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-navy">{u.prenom} {u.nom}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === "admin" ? "bg-sky/10 text-sky" :
                        u.role === "proprietaire" ? "bg-navy/10 text-navy" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.role !== "admin" && (
                        <select
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) changeRole(u.id, e.target.value); }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          <option value="">Changer rôle</option>
                          {["locataire", "proprietaire", "admin"].filter((r) => r !== u.role).map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
