import { Link } from "react-router-dom";
import heroImg from "../assets/pexels-elijahjcobb-35599466.jpg";

const REASSURANCE = [
  "Paiement 100% sécurisé",
  "Bateaux et propriétaires vérifiés",
  "Support réactif 7j/7",
];

// Panneau de gauche partagé par Login / Register / étape documents —
// même habillage (photo + dégradé navy + réassurance) sur tous les écrans
// d'authentification, pour rester cohérent avec le hero de l'accueil.
export default function AuthSidePanel({ title, text }) {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
      <img src={heroImg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/85 to-abysse/95" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(29,161,242,0.18),transparent_60%)]" />

      <Link to="/" className="relative z-10 font-heading text-2xl font-semibold">SailingLoc</Link>

      <div className="relative z-10">
        <h1 className="font-heading text-4xl font-semibold leading-tight">{title}</h1>
        <p className="mt-4 max-w-md text-white/70">{text}</p>
        <ul className="mt-8 space-y-3">
          {REASSURANCE.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-sable" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10.5l3.5 3.5L16 5.5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-sm text-white/50">© {new Date().getFullYear()} SailingLoc — Agence Pandawan</p>
    </div>
  );
}
