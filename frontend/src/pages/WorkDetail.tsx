import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiPlus, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
import { workService } from "../services/work.service";
import { AddToCollectionModal } from "../components/AddToCollectionModal";
import { SEO } from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import type { Work } from "../types/work.types";

export const WorkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [work, setWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadWorkDetail = async () => {
      if (!id) {
        setError("ID de l'œuvre manquant");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const response = await workService.getWorkById(id);
        setWork(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de l'œuvre",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkDetail();
  }, [id]);

  const nextImage = () => {
    if (work?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % work.images!.length);
    }
  };

  const prevImage = () => {
    if (work?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + work.images!.length) % work.images!.length,
      );
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div
            className="w-12 h-12 border-4 border-action-color border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Chargement de l'œuvre"
          ></div>
        </div>
      </main>
    );
  }

  if (error || !work) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        <SEO
          title="Erreur - Gather"
          description="Une erreur est survenue lors du chargement de l'œuvre"
        />
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          {error || "Œuvre introuvable"}
        </div>
      </main>
    );
  }

  const images = work.images || [];
  const hasMultipleImages = images.length > 1;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <SEO
        title={`${work.title} - Gather`}
        description={`Découvrez ${work.title} par ${work.author}. ${work.genre.join(", ")}`}
        keywords={`${work.title}, ${work.author}, ${work.type}, ${work.genre.join(", ")}`}
      />

      {/* Contenu principal */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6">
        {/* Section Image */}
        <div className="space-y-2">
          {images.length > 0 ? (
            <>
              <div className="relative w-fit">
                <img
                  src={images[currentImageIndex]}
                  alt={`${work.title} - Image ${currentImageIndex + 1}`}
                  className="w-70 aspect-[2/3] object-cover rounded-lg shadow-md"
                />
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1.5 transition-all"
                      aria-label="Image précédente"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1.5 transition-all"
                      aria-label="Image suivante"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Miniature ${idx + 1}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-14 h-14 object-cover rounded cursor-pointer border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-action-color scale-105"
                          : "border-slate-300 opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-fit">
              <div className="w-56 aspect-[2/3] bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shadow-md">
                <FiImage className="w-12 h-12 text-slate-400" />
              </div>
            </div>
          )}

          {/* Bouton Ajouter à une collection - uniquement si connecté */}
          {isAuthenticated && (
            <button
              onClick={() => setShowAddModal(true)}
              className="cursor-pointer w-full bg-action-color hover:bg-action-color-hover text-slate-100 font-bold px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <FiPlus className="w-5 h-5" />
              Ajouter à une collection
            </button>
          )}

          {/* Informations détaillées */}
          <div className="space-y-3 bg-primary-color rounded-lg p-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-1 uppercase tracking-wide">
                Type
              </h3>
              <p className="text-slate-700 capitalize">{work.type}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-1 uppercase tracking-wide">
                Année de publication
              </h3>
              <p className="text-slate-700">
                {new Date(work.publishedAt).getFullYear()}
              </p>
            </div>

            {work.genre && work.genre.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
                  Genres ({work.genre.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {work.genre.map((g, idx) => (
                    <span
                      key={idx}
                      className="bg-action-color text-slate-100 text-sm px-2.5 py-1 rounded-lg font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Texte */}
        <div className="space-y-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            {work.title}
          </h1>
          <p className="text-lg text-slate-700 font-medium">{work.author}</p>

          {work.description && (
            <div className="bg-primary-color rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {work.description}
              </p>
            </div>
          )}

          <div className="bg-primary-color rounded-lg p-4">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Avis de la communauté
            </h3>
            <p className="text-slate-700 text-sm italic">
              Les avis seront bientôt disponibles...
            </p>
          </div>
        </div>
      </div>

      {/* Modale d'ajout à collection */}
      <AddToCollectionModal
        work={showAddModal ? work : null}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => setShowAddModal(false)}
      />
    </main>
  );
};
