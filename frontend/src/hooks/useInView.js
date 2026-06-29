import { useEffect, useRef, useState } from "react";

// Détecte quand un élément entre dans le viewport, pour déclencher une
// apparition en fondu au scroll (voir components/Reveal.jsx). Pas de
// librairie d'animation : juste l'API IntersectionObserver du navigateur.
export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}