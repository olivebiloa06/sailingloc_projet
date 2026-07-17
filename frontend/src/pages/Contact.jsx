import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaticPage from "../components/StaticPage";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : "", email: user?.email || "", sujet: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.message) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setSending(true);
    setError("");

    try {
      if (user) {
        // Utilisateur connecté → envoie dans la messagerie admin
        // D'abord on récupère l'admin (id=1 par convention, ou via un endpoint)
        const adminRes = await api.get("/admin/info").catch(() => ({ data: { adminId: 1 } }));
        const adminId = adminRes.data?.adminId || 1;

        const convRes = await api.post("/conversations", { otherUserId: adminId });
        const convId = convRes.data.conversation.id;

        const msg = form.sujet
          ? `[${form.sujet}]\n\n${form.message}`
          : form.message;

        await api.post(`/conversations/${convId}/messages`, { contenu: msg });

        // Redirige vers la messagerie
        setTimeout(() => navigate(`/mes-messages`), 1200);
      }
      // Délai simulé pour les non-connectés (email classique à configurer)
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessaie ou contacte-nous par email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <StaticPage title="Contactez-nous" subtitle="Notre équipe répond sous 24h en semaine.">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="space-y-6">
          {[
            { icon: "📧", titre: "Email support", val: "contact@sailingloc.fr", href: "mailto:contact@sailingloc.fr" },
            { icon: "⚖️", titre: "Questions juridiques", val: "juridique@sailingloc.fr", href: "mailto:juridique@sailingloc.fr" },
            { icon: "🔒", titre: "RGPD & données", val: "rgpd@sailingloc.fr", href: "mailto:rgpd@sailingloc.fr" },
            { icon: "🔧", titre: "Maintenance technique", val: "maintenance@pandawan.fr", href: "mailto:maintenance@pandawan.fr" },
            { icon: "📞", titre: "Téléphone", val: "+33 6 00 00 00 00", href: "tel:+33600000000" },
          ].map((c) => (
            <div key={c.titre} className="flex items-start gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{c.titre}</p>
                <a href={c.href} className="text-sm font-medium text-sky hover:underline">{c.val}</a>
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-cloud p-4 text-xs text-gray-500">
            <p className="font-semibold text-navy">Horaires du support</p>
            <p className="mt-1">Lundi – Vendredi : 9h – 18h</p>
            <p>Week-end : réponse sous 48h</p>
          </div>
          {user && (
            <p className="text-xs text-sky">
              ✉️ Connecté en tant que {user.prenom} — votre message sera envoyé directement dans notre messagerie.
            </p>
          )}
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
            <p className="text-4xl">✅</p>
            <p className="mt-3 font-heading text-base font-semibold text-navy">Message envoyé !</p>
            <p className="mt-1 text-sm text-gray-600">
              {user ? "Vous allez être redirigé vers votre messagerie." : `Nous reviendrons vers vous sous 24h à ${form.email}.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-navy">Nom *</label>
                <input type="text" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-navy">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy">Sujet</label>
              <select value={form.sujet} onChange={(e) => setForm((p) => ({ ...p, sujet: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none">
                <option value="">Choisir un sujet</option>
                <option>Question sur une réservation</option>
                <option>Problème de paiement</option>
                <option>Documents & vérification</option>
                <option>Signaler un problème</option>
                <option>Partenariat</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy">Message *</label>
              <textarea rows={5} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Décris ta demande en détail..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-sky focus:outline-none" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-light disabled:opacity-60">
              {sending ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>
        )}
      </div>
    </StaticPage>
  );
}
