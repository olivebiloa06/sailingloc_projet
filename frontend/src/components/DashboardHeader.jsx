// Bandeau d'accueil partagé par les tableaux de bord locataire et
// propriétaire — mêmes codes visuels (navy, avatar, salutation) que le
// reste du site, pour que "mon compte" ne fasse pas rupture avec la vitrine.
export default function DashboardHeader({ name, subtitle, onLogout }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy px-6 py-6 text-white shadow-[0_10px_30px_-12px_rgba(10,42,67,0.4)] sm:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-sable">
          {name?.charAt(0)}
        </div>
        <div>
          <h1 className="font-heading text-xl font-semibold sm:text-2xl">Bonjour, {name} 👋</h1>
          <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white hover:text-white"
      >
        Se déconnecter
      </button>
    </div>
  );
}
