import { useState, useEffect } from 'react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/helpers';

const EMPTY_FORM = {
  clientName:  '',
  projectName: '',
  description: '',
  status:      'Planning',
  priority:    'Medium',
  startDate:   '',
  dueDate:     '',
};

function validateClient(data) {
  const errors = {};

  if (!data.clientName.trim())  errors.clientName  = 'Client Name is required';
  if (!data.projectName.trim()) errors.projectName = 'Project Name is required';
  if (!data.startDate)          errors.startDate   = 'Start Date is required';
  if (!data.dueDate)            errors.dueDate     = 'Due Date is required';

  if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
    errors.dueDate = 'Due Date cannot be earlier than Start Date';
  }

  return errors;
}

export default function ProjectFormModal({ isOpen, project, onClose, onSubmit, isSubmitting }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const isEditing = Boolean(project);

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      setForm(project
        ? {
            clientName:  project.clientName,
            projectName: project.projectName,
            description: project.description || '',
            status:      project.status,
            priority:    project.priority,
            startDate:   project.startDate,
            dueDate:     project.dueDate,
          }
        : EMPTY_FORM
      );
      setErrors({});
      setApiError('');
    }
  }, [isOpen, project]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validateClient(form);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      if (err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        setApiError(err.message || 'Something went wrong');
      }
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-form-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 id="modal-form-title" className="modal-title">
            {isEditing ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            id="modal-close-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {apiError && (
            <div className="error-banner" role="alert" style={{ marginBottom: '1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form className="form" onSubmit={handleSubmit} id="project-form" noValidate>
            {/* Client Name + Project Name */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="field-client-name" className="form-label">
                  Client Name <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="field-client-name"
                  type="text"
                  className={`form-input${errors.clientName ? ' error' : ''}`}
                  value={form.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  aria-required="true"
                  aria-describedby={errors.clientName ? 'err-clientName' : undefined}
                />
                {errors.clientName && (
                  <span id="err-clientName" className="field-error" role="alert">
                    {errors.clientName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="field-project-name" className="form-label">
                  Project Name <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="field-project-name"
                  type="text"
                  className={`form-input${errors.projectName ? ' error' : ''}`}
                  value={form.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  placeholder="e.g. Website Redesign"
                  required
                  aria-required="true"
                  aria-describedby={errors.projectName ? 'err-projectName' : undefined}
                />
                {errors.projectName && (
                  <span id="err-projectName" className="field-error" role="alert">
                    {errors.projectName}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="field-description" className="form-label">Description</label>
              <textarea
                id="field-description"
                className="form-textarea"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the project…"
                rows={3}
              />
            </div>

            {/* Status + Priority */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="field-status" className="form-label">
                  Status <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="field-status"
                  className={`form-select${errors.status ? ' error' : ''}`}
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  required
                  aria-required="true"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.status && (
                  <span className="field-error" role="alert">{errors.status}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="field-priority" className="form-label">
                  Priority <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="field-priority"
                  className={`form-select${errors.priority ? ' error' : ''}`}
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  required
                  aria-required="true"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.priority && (
                  <span className="field-error" role="alert">{errors.priority}</span>
                )}
              </div>
            </div>

            {/* Start + Due Date */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="field-start-date" className="form-label">
                  Start Date <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="field-start-date"
                  type="date"
                  className={`form-input${errors.startDate ? ' error' : ''}`}
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={errors.startDate ? 'err-startDate' : undefined}
                />
                {errors.startDate && (
                  <span id="err-startDate" className="field-error" role="alert">
                    {errors.startDate}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="field-due-date" className="form-label">
                  Due Date <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="field-due-date"
                  type="date"
                  className={`form-input${errors.dueDate ? ' error' : ''}`}
                  value={form.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={errors.dueDate ? 'err-dueDate' : undefined}
                  min={form.startDate || undefined}
                />
                {errors.dueDate && (
                  <span id="err-dueDate" className="field-error" role="alert">
                    {errors.dueDate}
                  </span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                id="cancel-form-btn"
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                id="submit-form-btn"
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? (isEditing ? 'Saving…' : 'Creating…')
                  : (isEditing ? 'Save Changes' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
