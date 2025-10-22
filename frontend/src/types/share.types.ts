import type { User } from './auth.types';
import type { Collection } from './collection.types';

export type ShareRights = 'read' | 'edit';
export type ShareStatus = 'pending' | 'refused' | 'accepted';

export interface Share {
  _id: string;
  collectionId: string | Collection;
  guestId: string | User;
  authorId: string | User;
  rights: ShareRights;
  status: ShareStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareInput {
  collectionId: string;
  guestId: string;
  rights?: ShareRights;
}

export interface UpdateShareStatusInput {
  status: ShareStatus;
}

export interface ShareResponse {
  success: boolean;
  message: string;
  data: {
    share: Share;
  } | null;
  errors?: string;
}

export interface SharesResponse {
  success: boolean;
  message: string;
  data: {
    shares: Share[];
  } | null;
  errors?: string;
}
