import { getStatusMeta, getPriorityMeta, formatDate } from '../utils/helpers';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const status   = getStatusMeta(project.status);
  const priority = getPriorityMeta(project.priority);

  return (
    <article
      className="project-card"
      aria-label={`Project: ${project.projectName}`}
    >
      {/* Header row: badges + actions */}
      <div className="card-header">
        <div className="card-badges">
          <span className={`badge ${status.cls}`}>
            <span className="badge-dot" aria-hidden="true" />
            {status.label}
          </span>
          <span className={`badge ${priority.cls}`}>
            {priority.label}
          </span>
        </div>

        <div className="card-actions">
          <button
            id={`edit-project-${project.id}`}
            className="btn btn-ghost btn-icon"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.projectName}`}
            title="Edit project"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5
                   m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            id={`delete-project-${project.id}`}
            className="btn btn-ghost btn-icon"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.projectName}`}
            title="Delete project"
            style={{ color: 'var(--color-danger)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6
                   m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        <h2 className="card-project-name">{project.projectName}</h2>
        <p className="card-client-name">{project.clientName}</p>
        {project.description && (
          <p className="card-description" style={{ marginTop: '0.5rem' }}>
            {project.description}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="card-dates">
        <div className="date-item">
          <span className="date-label">Start</span>
          <span className="date-value">{formatDate(project.startDate)}</span>
        </div>
        <div className="date-item">
          <span className="date-label">Due</span>
          <span className="date-value">{formatDate(project.dueDate)}</span>
        </div>
        <div className="date-item" style={{ marginLeft: 'auto' }}>
          <span className="date-label">ID</span>
          <span className="date-value" style={{ color: 'var(--color-text-faint)' }}>#{project.id}</span>
        </div>
      </div>
    </article>
  );
}
