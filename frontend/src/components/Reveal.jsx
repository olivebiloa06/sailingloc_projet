import { useInView } from "../hooks/useInView";

// Enveloppe une section pour qu'elle apparaisse en fondu-montant quand elle
// entre dans le viewport — donne le côté "fluide" demandé sur la page
// d'accueil, sans librairie d'animation externe.
export default function Reveal({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
