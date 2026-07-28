export default function StaticPage({ title, subtitle, children, lastUpdated }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Carte principale avec effet verre */}
      <div className="rounded-2xl bg-white/85 p-8 shadow-2xl backdrop-blur-md">
        {/* Header de la page */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="font-heading text-3xl font-semibold text-navy sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-gray-500">{subtitle}</p>
          )}
          {lastUpdated && (
            <p className="mt-1 text-xs text-gray-400">
              Dernière mise à jour : {lastUpdated}
            </p>
          )}
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
