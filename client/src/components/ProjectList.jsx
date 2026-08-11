import ProjectCard from './ProjectCard';

// Skeleton loader cards shown while fetching
function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-badge" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-client" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc-2" />
      <div className="skeleton skeleton-dates" />
    </div>
  );
}

export default function ProjectList({ projects, isLoading, error, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="skeleton-grid" aria-label="Loading projects">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner" role="alert">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="state-container" role="status">
        <div className="state-icon" aria-hidden="true">📋</div>
        <p className="state-title">No projects found</p>
        <p className="state-subtitle">
          Try adjusting your search or filters, or create a new project to get started.
        </p>
      </div>
    );
  }

  return (
    <main
      className="projects-grid"
      aria-label={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </main>
  );
}
