import { useState, useRef } from "react";
import { userService } from "../services/user.service";
import { FiUploadCloud } from "react-icons/fi";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (newAvatarUrl: string | null) => void;
}

export const AvatarUpload = ({
  currentAvatarUrl,
  onAvatarChange,
}: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Le fichier est trop volumineux (max 5MB)";
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Format non supporté. Utilisez JPEG, PNG ou WebP";
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const avatarUrl = await userService.uploadAvatar(file);
      onAvatarChange(avatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.currentTarget === e.target ||
      e.currentTarget.contains(e.target as Node)
    ) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Ne masquer que si on quitte vraiment le conteneur
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Zone de drag & drop avec preview */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-32 h-32 rounded-full overflow-hidden
          transition-all duration-200 group
          ${uploading ? "cursor-not-allowed opacity-75" : "cursor-pointer"}
        `}
      >
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary-color flex items-center justify-center text-slate-700 text-4xl font-semibold">
            ?
          </div>
        )}

        <div
          className={`
          absolute inset-0 bg-black/50 flex flex-col items-center justify-center
          transition-opacity duration-200
          ${uploading || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
        >
          {uploading ? (
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-xs font-medium">Upload...</p>
            </div>
          ) : (
            <div className="text-white text-center">
              <FiUploadCloud className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {isDragging ? "Déposez ici" : "Drag & Drop"}
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Informations */}
      <p className="text-sm text-slate-700">
        Cliquez ou glissez-déposez une image • Formats : JPEG, PNG, WebP • Max :
        5MB
      </p>
    </div>
  );
};
