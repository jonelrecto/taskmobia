export default function Header({ stats, projects = [], user, onCreateClick, onLogout }) {
  const total      = stats?.total      ?? projects.length;
  const inProgress = stats?.inProgress ?? projects.filter((p) => p.status === 'In Progress').length;
  const completed  = stats?.completed  ?? projects.filter((p) => p.status === 'Completed').length;
  const onHold     = stats?.onHold     ?? projects.filter((p) => p.status === 'On Hold').length;

  // User initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">PF</div>
          <div>
            <div className="header-title">ProjectFlow</div>
            <div className="header-subtitle">Client Project Tracker</div>
          </div>
        </div>

        {/* Stats */}
        <nav className="header-stats" aria-label="Project statistics">
          <div className="stat-chip">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-chip --primary">
            <span className="stat-value">{inProgress}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-chip --warning">
            <span className="stat-value">{onHold}</span>
            <span className="stat-label">On Hold</span>
          </div>
          <div className="stat-chip --success">
            <span className="stat-value">{completed}</span>
            <span className="stat-label">Done</span>
          </div>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button
            id="create-project-btn"
            className="btn btn-primary"
            onClick={onCreateClick}
            aria-label="Create a new project"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>

          {/* User menu */}
          <div className="user-menu" aria-label={`Logged in as ${user?.name}`}>
            <div className="user-avatar" aria-hidden="true" title={user?.name}>
              {initials}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
            </div>
            <button
              id="logout-btn"
              className="btn btn-ghost btn-icon"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
