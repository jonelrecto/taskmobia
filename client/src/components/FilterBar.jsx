import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'priority-desc',  label: 'Priority: High → Low' },
  { value: 'priority-asc',   label: 'Priority: Low → High' },
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc',  label: 'Oldest first' },
  { value: 'dueDate-asc',    label: 'Due date ↑' },
  { value: 'dueDate-desc',   label: 'Due date ↓' },
  { value: 'projectName-asc', label: 'Name A→Z' },
];

export default function FilterBar({ filters, onChange, count, total }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function handleSortChange(value) {
    const [sortBy, sortOrder] = value.split('-');
    onChange({ ...filters, sortBy, sortOrder });
  }

  const sortValue = `${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`;

  return (
    <div className="filter-bar" role="search" aria-label="Filter and sort projects">
      {/* Search */}
      <div className="search-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder="Search projects, clients…"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {/* Status Filter */}
      <select
        id="filter-status"
        className="filter-select"
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        id="filter-priority"
        className="filter-select"
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        id="filter-sort"
        className="filter-select"
        value={sortValue}
        onChange={(e) => handleSortChange(e.target.value)}
        aria-label="Sort projects"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Results Count */}
      <span className="filter-results" aria-live="polite">
        {count === total
          ? `${total} project${total !== 1 ? 's' : ''}`
          : `${count} of ${total}`}
      </span>
    </div>
  );
}
