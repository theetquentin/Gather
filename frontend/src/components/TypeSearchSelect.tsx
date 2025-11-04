import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { WORK_TYPES } from "../constants/work.constants";

interface TypeSearchSelectProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export const TypeSearchSelect = ({
  selectedType,
  onSelectType,
}: TypeSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gérer le clic en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelectType(value);
    setIsOpen(false);
  };

  // Afficher la valeur sélectionnée
  const displayValue =
    WORK_TYPES.find((opt) => opt.value === selectedType)?.label || "";

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium text-slate-900 mb-1">Type</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-4 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-left flex items-center justify-between"
      >
        <span>{displayValue}</span>
        <FiChevronDown className="text-slate-700 w-4 h-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-primary-color border border-slate-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {WORK_TYPES.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2 text-slate-900 hover:bg-secondary-color transition-colors ${
                option.value === selectedType
                  ? "bg-secondary-color font-medium"
                  : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
