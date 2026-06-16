import { SEARCH_TERM_MAX_LENGTH } from '../utils/todoValidation.js';

export default function FilterInput({ filterTerm, onFilterChange }) {
  return (
    <div className="field">
      <label htmlFor="filterInput">Search todos:</label>
      <input
        id="filterInput"
        maxLength={SEARCH_TERM_MAX_LENGTH}
        type="text"
        value={filterTerm}
        onChange={(event) => onFilterChange(event.target.value)}
        placeholder="Search by title..."
      />
    </div>
  );
}
