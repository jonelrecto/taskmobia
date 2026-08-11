export default function Pagination({ pagination, onPageChange, onLimitChange }) {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to render
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="pagination-container" aria-label="Project list pagination">
      {/* Range summary */}
      <div className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{total}</strong> projects
      </div>

      {/* Page controls & limit selector */}
      <div className="pagination-controls">
        {/* Limit selector */}
        <div className="pagination-limit">
          <label htmlFor="pagination-limit-select" className="sr-only">
            Projects per page
          </label>
          <select
            id="pagination-limit-select"
            className="filter-select pagination-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            aria-label="Projects per page"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
          </select>
        </div>

        {/* Page buttons */}
        <div className="pagination-pages">
          <button
            id="prev-page-btn"
            className="btn btn-secondary btn-icon pagination-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            aria-label="Previous page"
            title="Previous page"
          >
            ‹
          </button>

          {pages.map((p) => (
            <button
              key={p}
              id={`page-btn-${p}`}
              className={`pagination-number${p === page ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          ))}

          <button
            id="next-page-btn"
            className="btn btn-secondary btn-icon pagination-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            aria-label="Next page"
            title="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );
}
