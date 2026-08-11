/**
 * Returns CSS class name and display label for a status value.
 */
export function getStatusMeta(status) {
  const map = {
    'Planning':    { cls: 'badge-planning',    label: 'Planning' },
    'In Progress': { cls: 'badge-in-progress', label: 'In Progress' },
    'On Hold':     { cls: 'badge-on-hold',     label: 'On Hold' },
    'Completed':   { cls: 'badge-completed',   label: 'Completed' },
  };
  return map[status] || { cls: 'badge-planning', label: status };
}

/**
 * Returns CSS class name for a priority value.
 */
export function getPriorityMeta(priority) {
  const map = {
    Low:    { cls: 'badge-low',    label: 'Low' },
    Medium: { cls: 'badge-medium', label: 'Med' },
    High:   { cls: 'badge-high',   label: 'High' },
  };
  return map[priority] || { cls: 'badge-low', label: priority };
}

/**
 * Format a YYYY-MM-DD string to a readable display date.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

export const STATUS_OPTIONS = ['Planning', 'In Progress', 'On Hold', 'Completed'];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
