import { useEffect } from 'react';

export default function DeleteConfirmModal({ isOpen, project, onClose, onConfirm, isDeleting }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog modal-sm">
        <div className="delete-modal-body">
          <div className="delete-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6
                   m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>

          <h2 id="delete-modal-title" className="delete-title">Delete Project?</h2>
          <p id="delete-modal-desc" className="delete-subtitle">
            Are you sure you want to delete{' '}
            <strong>{project.projectName}</strong>?{' '}
            This action cannot be undone.
          </p>

          <div className="delete-actions">
            <button
              id="cancel-delete-btn"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              className="btn btn-danger"
              onClick={() => onConfirm(project.id)}
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
