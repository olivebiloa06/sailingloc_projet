/**
 * Hook SEO — met à jour dynamiquement le <title> et les meta tags
 * Utilisé sur toutes les pages publiques pour améliorer le référencement
 * Note : pour un SEO optimal, une migration vers SSR (Next.js) serait nécessaire
 * car les moteurs de recherche voient la page avant l'exécution du JavaScript.
 */
import { useEffect } from "react";

const BASE_TITLE = "SailingLoc — Location de bateaux entre particuliers";
const BASE_DESCRIPTION = "SailingLoc — Louez ou proposez votre bateau en France et en Europe. Paiement sécurisé, contrat automatique, messagerie intégrée.";
const BASE_URL = "https://sailingloc.fr";
const BASE_IMAGE = "https://sailingloc.fr/og-image.jpg";

export function usePageMeta({
  title,
  description,
  url,
  image,
  type = "website",
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — SailingLoc` : BASE_TITLE;
    const fullDescription = description || BASE_DESCRIPTION;
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const fullImage = image || BASE_IMAGE;

    // Title
    document.title = fullTitle;

    // Meta description
    setMeta("name", "description", fullDescription);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", fullDescription);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:image", fullImage);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "SailingLoc");
    setMeta("property", "og:locale", "fr_FR");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", fullDescription);
    setMeta("name", "twitter:image", fullImage);

    // Canonical
    setLink("canonical", fullUrl);
  }, [title, description, url, image, type]);
}

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}