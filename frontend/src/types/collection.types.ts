import type { Work } from './work.types';

export type CollectionType = 'book' | 'movie' | 'series' | 'music' | 'game' | 'other';
export type CollectionVisibility = 'private' | 'public' | 'shared';

export interface Collection {
  _id: string;
  name: string;
  type: CollectionType;
  visibility: CollectionVisibility;
  userId: string;
  works: Work[];
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
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
