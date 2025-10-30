/**
 * SEO Schemas - Structured Data helpers
 *
 * Ce fichier contient les fonctions et constantes pour générer
 * des structured data (JSON-LD) conformes à schema.org
 */

/**
 * Données structurées pour l'organisation Gather
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Gather",
  description:
    "Gather - Gérez et partagez vos collections personnelles de livres, films, séries, musique, jeux et plus encore.",
  url: typeof window !== "undefined" ? window.location.origin : "",
  logo:
    typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "",
  sameAs: [
    // Ajouter réseaux
    // "https://twitter.com/gather",
    // "https://facebook.com/gather",
  ],
};

/**
 * Données structurées pour le site web
 */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gather",
  description:
    "Gérez et partagez vos collections personnelles de livres, films, séries, musique, jeux et plus encore.",
  url: typeof window !== "undefined" ? window.location.origin : "",
};

/**
 * Crée un schema de type Collection pour une collection utilisateur
 */
export const createCollectionSchema = (collection: {
  name: string;
  description?: string;
  type: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Collection",
  name: collection.name,
  description: collection.description || `Collection de ${collection.type}`,
  url: collection.url,
});

/**
 * Crée un schema de type BreadcrumbList pour la navigation
 */
export const createBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
