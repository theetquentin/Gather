import type { CollectionVisibility } from "../types/collection.types";

/**
 * Configuration complète de la visibilité des collections
 * Regroupe value, label, description, et styles pour chaque type de visibilité
 */
export const VISIBILITY_CONFIG: Record<
  CollectionVisibility,
  {
    value: CollectionVisibility;
    label: string;
    description: string;
    color: string;
    text: string;
  }
> = {
  private: {
    value: "private",
    label: "Privée",
    description: "Visible uniquement par vous",
    color: "bg-private-tag",
    text: "text-private-tag-txt",
  },
  public: {
    value: "public",
    label: "Publique",
    description: "Visible par tous les utilisateurs",
    color: "bg-public-tag",
    text: "text-public-tag-txt",
  },
  shared: {
    value: "shared",
    label: "Partagée",
    description: "Visible par les utilisateurs invités",
    color: "bg-shared-tag",
    text: "text-shared-tag-txt",
  },
};
