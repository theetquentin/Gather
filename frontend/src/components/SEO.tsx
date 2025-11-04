import type { ReactNode } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  children?: ReactNode;
}

/**
 * SEO Component
 *
 * Utilise les features natives de React 19 pour gérer les meta tags.
 * Les balises <title>, <meta>, et <link> sont automatiquement hoistées dans le <head>.
 *
 * @example
 * <SEO
 *   title="Ma Collection - Gather"
 *   description="Découvrez ma collection de livres et films"
 *   keywords="collection, livres, films"
 * />
 */
export const SEO = ({
  title,
  description,
  keywords,
  ogType = "website",
  ogImage,
  canonical,
  noindex = false,
}: SEOProps) => {
  const siteUrl =
    import.meta.env.VITE_API_DOMAIN?.replace("api.", "") ||
    window.location.origin;
  const currentUrl = canonical || window.location.href;
  const defaultImage = `${siteUrl}/og-image.jpg`;

  return (
    <>
      <title>{title}</title>

      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <link rel="canonical" href={currentUrl} />

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:site_name" content="Gather" />
      <meta property="og:locale" content="fr_FR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />

      <meta name="author" content="Gather" />
      <meta name="language" content="French" />
    </>
  );
};
