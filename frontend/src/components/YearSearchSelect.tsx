import { useState, useRef, useEffect, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi";

interface YearSearchSelectProps {
  selectedYear: string;
  onSelectYear: (year: string) => void;
}

export const YearSearchSelect = ({
  selectedYear,
  onSelectYear,
}: YearSearchSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options: Array<{ value: string; label: string }> = [
      { value: "", label: "Toutes les années" },
    ];

    // Générer les années de l'année actuelle jusqu'à 1900
    for (let year = currentYear; year >= 1900; year--) {
      options.push({ value: year.toString(), label: year.toString() });
    }

    // Ajouter "Avant 1900" à la fin
    options.push({ value: "before-1900", label: "Avant 1900" });

    return options;
  }, []);

  // Filtrer les options selon la recherche
  const filteredOptions = yearOptions.filter((option) =>
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
    onSelectYear(value);
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Afficher la valeur sélectionnée dans l'input
  const displayValue =
    searchQuery ||
    yearOptions.find((opt) => opt.value === selectedYear)?.label ||
    "";

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium text-slate-900 mb-1">Année</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher une année..."
          className="w-full h-10 pl-4 pr-10 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
          autoComplete="off"
        />
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 w-4 h-4 pointer-events-none" />
      </div>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-primary-color border border-slate-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2 text-slate-900 hover:bg-secondary-color transition-colors ${
                option.value === selectedYear
                  ? "bg-secondary-color font-medium"
                  : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {isOpen && searchQuery && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-primary-color border border-slate-400 rounded-lg shadow-lg px-4 py-3 text-slate-700 text-sm">
          Aucune année trouvée pour "{searchQuery}"
        </div>
      )}
    </div>
  );
};
