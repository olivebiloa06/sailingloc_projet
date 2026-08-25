// Mockup de téléphone en CSS pur (pas d'image de device externe à charger),
// avec l'écran rempli par un screenshot réel du site. Utilisé pour teaser
// l'app mobile à venir (voir MobileAppTeaser).
export default function PhoneMockup({ src, alt, className = "" }) {
  return (
    <div className={`relative mx-auto w-[190px] select-none sm:w-[210px] ${className}`}>
      <div className="relative rounded-[2.25rem] border-[6px] border-navy bg-navy p-2 shadow-[0_25px_60px_-15px_rgba(6,27,46,0.5)]">
        {/* Encoche */}
        <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-navy" />
        <div className="relative aspect-[9/16.5] overflow-hidden rounded-[1.7rem] bg-white">
          <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
        </div>
      </div>
      {/* Bouton latéral, purement décoratif */}
      <div className="absolute -right-[7px] top-20 h-10 w-[6px] rounded-r-full bg-navy/80" />
      <div className="absolute -left-[7px] top-14 h-6 w-[6px] rounded-l-full bg-navy/80" />
      <div className="absolute -left-[7px] top-24 h-6 w-[6px] rounded-l-full bg-navy/80" />
    </div>
  );
}
