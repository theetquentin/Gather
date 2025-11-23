import type { Work } from './work.types';
import type { ShareRights } from './share.types';

export type CollectionType = 'book' | 'movie' | 'series' | 'music' | 'game' | 'other';
export type CollectionVisibility = 'private' | 'public' | 'shared';

export interface Collection {
  _id: string;
  name: string;
  type: CollectionType;
  visibility: CollectionVisibility;
  authorId: string | { _id: string; username: string; email: string }; // Propriétaire de la collection
  works: Work[];
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
  // Champs ajoutés pour les collections partagées
  owned?: boolean; // true si c'est la collection de l'utilisateur, false si partagée
  rights?: ShareRights; // Droits d'accès si collection partagée (read/edit)
}

export interface CreateCollectionInput {
  name: string;
  type: CollectionType;
  visibility: CollectionVisibility;
  works?: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  type?: CollectionType;
  visibility?: CollectionVisibility;
  works?: string[];
}
