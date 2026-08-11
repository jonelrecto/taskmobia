export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          role="alert"
          onClick={() => onRemove(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span className="toast-icon">{icons[t.type] || icons.info}</span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
