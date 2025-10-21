import { useState, type FormEvent } from 'react';
import { WorkSelector } from './WorkSelector';
import { ErrorMessage } from './ErrorMessage';
import { COLLECTION_TYPES, VISIBILITY_OPTIONS } from '../constants/collection.constants';
import type { CollectionType, CollectionVisibility, CreateCollectionInput } from '../types/collection.types';

interface CollectionFormProps {
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const CollectionForm = ({ onSubmit, onCancel, isLoading = false }: CollectionFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CollectionType>('book');
  const [visibility, setVisibility] = useState<CollectionVisibility>('private');
  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([]);
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
      await onSubmit({
        name: name.trim(),
        type,
        visibility,
        works: selectedWorkIds.length > 0 ? selectedWorkIds : undefined
      });
      // Réinitialiser le formulaire
      setName('');
      setType('book');
      setVisibility('private');
      setSelectedWorkIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <ErrorMessage message={error} />}

      <div>
        <label htmlFor="name" className="block text-slate-900 font-medium mb-1 text-sm">
          Nom de la collection *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
          placeholder="Ex: Ma collection de science-fiction"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-slate-900 font-medium mb-1 text-sm">
          Type de collection *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as CollectionType)}
          className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
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

      <div>
        <label htmlFor="visibility" className="block text-slate-900 font-medium mb-1 text-sm">
          Visibilité *
        </label>
        <select
          id="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as CollectionVisibility)}
          className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
          required
          disabled={isLoading}
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>

      <WorkSelector
        collectionType={type}
        selectedWorkIds={selectedWorkIds}
        onWorksChange={setSelectedWorkIds}
      />

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-secondary-color hover:bg-primary-color text-slate-900 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Création...' : 'Créer la collection'}
        </button>
      </div>
    </form>
  );
};
