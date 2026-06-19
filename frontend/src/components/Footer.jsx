import { Link } from "react-router-dom";
import HorizonDivider from "./HorizonDivider";

const COLUMNS = [
  {
    title: "Navigation",
    links: [
      { to: "/boats", label: "Explorer les bateaux" },
      { to: "/#comment-ca-marche", label: "Comment ça marche" },
      { to: "/a-propos", label: "À propos" },
      { to: "/avis", label: "Avis" },
    ],
  },
  {
    title: "Assistance",
    links: [
      { to: "/aide", label: "Centre d'aide" },
      { to: "/contact", label: "Contact" },
      { to: "/securite", label: "Sécurité & confiance" },
    ],
  },
  {
    title: "Propriétaires",
    links: [
      { to: "/register?role=proprietaire", label: "Mettre mon bateau en location" },
      { to: "/ressources-proprietaires", label: "Ressources propriétaires" },
      { to: "/assurance", label: "Assurance & garanties" },
    ],
  },
];

const LEGAL_LINKS = [
  { to: "/mentions-legales", label: "Mentions légales" },
  { to: "/confidentialite", label: "Confidentialité" },
  { to: "/cookies", label: "Cookies" },
];

export default function Footer() {
  return (
    <footer className="bg-abysse text-white/70">
      <HorizonDivider fill="var(--color-cloud)" flip />

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="font-heading text-xl font-semibold text-white">
              SailingLoc
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              La location de bateaux entre particuliers, simple et en
              confiance — voiliers, catamarans et bateaux à moteur partout en
              France.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm transition hover:text-sable"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} SailingLoc — Agence Pandawan
          </p>
          <ul className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-xs text-white/50 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
