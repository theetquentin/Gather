import { useState, useRef, useEffect, ReactNode } from "react";

interface SearchSelectProps {
  label: string;
  placeholder: string;
  selectedValues: string[];
  options: Array<{ value: string; label: string }>;
  onAdd: (value: string) => void;
  icon?: ReactNode;
}

export const SearchSelect = ({
  label,
  placeholder,
  selectedValues,
  options,
  onAdd,
  icon,
}: SearchSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrer les options disponibles (non sélectionnées et correspondant à la recherche)
  const availableOptions = options.filter(
    (option) =>
      option.value !== "" &&
      !selectedValues.includes(option.value) &&
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Gérer le clic en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onAdd(value);
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium text-slate-900 mb-1">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-10 pl-4 pr-10 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
          autoComplete="off"
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && availableOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-primary-color border border-slate-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {availableOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="w-full text-left px-4 py-2 text-slate-900 hover:bg-secondary-color transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {isOpen && searchQuery && availableOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-primary-color border border-slate-400 rounded-lg shadow-lg px-4 py-3 text-slate-700 text-sm">
          Aucun résultat pour "{searchQuery}"
        </div>
      )}
    </div>
  );
};
