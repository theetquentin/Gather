interface StructuredDataProps {
  data: Record<string, unknown>;
}

/**
 * StructuredData Component
 *
 * Ajoute du structured data (JSON-LD) pour améliorer le SEO.
 * Les moteurs de recherche utilisent ces données pour mieux comprendre le contenu.
 *
 * @example
 * import { organizationSchema } from '../constants/seoSchemas';
 *
 * <StructuredData data={organizationSchema} />
 */
export const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
