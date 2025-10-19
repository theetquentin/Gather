import { useState, type FormEvent } from 'react';
import type { CollectionType, CollectionVisibility, CreateCollectionInput } from '../types/collection.types';

interface CollectionFormProps {
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const COLLECTION_TYPES: { value: CollectionType; label: string }[] = [
  { value: 'book', label: 'Livres' },
  { value: 'movie', label: 'Films' },
  { value: 'series', label: 'Séries' },
  { value: 'music', label: 'Musique' },
  { value: 'game', label: 'Jeux vidéo' },
  { value: 'other', label: 'Autre' },
];

const VISIBILITY_OPTIONS: { value: CollectionVisibility; label: string; description: string }[] = [
  {
    value: 'private',
    label: 'Privée',
    description: 'Visible uniquement par vous'
  },
  {
    value: 'public',
    label: 'Publique',
    description: 'Visible par tous les utilisateurs'
  },
  {
    value: 'shared',
    label: 'Partagée',
    description: 'Visible par les utilisateurs invités'
  },
];

export const CollectionForm = ({ onSubmit, onCancel, isLoading = false }: CollectionFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CollectionType>('book');
  const [visibility, setVisibility] = useState<CollectionVisibility>('private');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom de la collection est requis');
      return;
    }

    if (name.trim().length < 3) {
      setError('Le nom doit contenir au moins 3 caractères');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), type, visibility });
      // Réinitialiser le formulaire
      setName('');
      setType('book');
      setVisibility('private');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Nom de la collection */}
      <div>
        <label htmlFor="name" className="block text-slate-900 font-semibold mb-2">
          Nom de la collection *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
          placeholder="Ex: Ma collection de science-fiction"
          required
          disabled={isLoading}
        />
      </div>

      {/* Type de collection */}
      <div>
        <label htmlFor="type" className="block text-slate-900 font-semibold mb-2">
          Type de collection *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as CollectionType)}
          className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
          required
          disabled={isLoading}
        >
          {COLLECTION_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Visibilité */}
      <div>
        <label className="block text-slate-900 font-semibold mb-3">
          Visibilité *
        </label>
        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                visibility === option.value
                  ? 'border-action-color bg-secondary-color'
                  : 'border-slate-400 bg-primary-color hover:bg-secondary-color'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={visibility === option.value}
                onChange={(e) => setVisibility(e.target.value as CollectionVisibility)}
                className="mt-1 mr-3"
                disabled={isLoading}
              />
              <div>
                <div className="font-medium text-slate-900">{option.label}</div>
                <div className="text-sm text-slate-700">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Création...' : 'Créer la collection'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 bg-secondary-color hover:bg-primary-color text-slate-900 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};
