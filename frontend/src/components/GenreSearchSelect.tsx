import { FiChevronDown } from "react-icons/fi";
import { SearchSelect } from "./SearchSelect";
import { WORK_GENRES } from "../constants/work.constants";

interface GenreSearchSelectProps {
  selectedGenres: string[];
  onAddGenre: (genre: string) => void;
}

export const GenreSearchSelect = ({
  selectedGenres,
  onAddGenre,
}: GenreSearchSelectProps) => {
  return (
    <SearchSelect
      label="Genre"
      placeholder="Rechercher un genre..."
      selectedValues={selectedGenres}
      options={WORK_GENRES}
      onAdd={onAddGenre}
      icon={<FiChevronDown className="w-4 h-4" />}
    />
  );
};
