import { useState, useEffect, useCallback } from 'react';
import './index.css';

import * as api from './api/projects';
import { setAuthToken } from './api/projects';
import { getMe } from './api/auth';
import { useToast } from './hooks/useToast';

import LoginPage from './components/LoginPage';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProjectList from './components/ProjectList';
import Pagination from './components/Pagination';
import ProjectFormModal from './components/ProjectFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ToastContainer from './components/ToastContainer';

const TOKEN_KEY = 'pf_token';

export default function App() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setAuthLoading(false); return; }

    setAuthToken(stored);
    getMe(stored)
      .then((user) => { setToken(stored); setCurrentUser(user); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setAuthLoading(false));
  }, []);

  function handleAuthenticated(newToken, user) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setCurrentUser(null);
    setProjects([]);
  }

  // ── Data state ────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [filters, setFilters] = useState({
    search: '', status: '', priority: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 12,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getProjectStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch project stats:', err);
    }
  }, [token]);

  // Fetch projects when authenticated or filters/page change
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setFetchError('');
    try {
      const res = await api.getProjects(filters);
      if (res && res.pagination) {
        setProjects(res.data);
        setPagination(res.pagination);
      } else {
        setProjects(Array.isArray(res) ? res : []);
        setPagination(null);
      }
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
      } else {
        setFetchError(err.message || 'Failed to load projects');
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchStats();
    }
  }, [fetchProjects, fetchStats, token]);

  // Handler when search/status/priority/sort changes -> reset page to 1
  function handleFilterChange(newFilters) {
    const isFilterReset =
      newFilters.search !== filters.search ||
      newFilters.status !== filters.status ||
      newFilters.priority !== filters.priority ||
      newFilters.sortBy !== filters.sortBy ||
      newFilters.sortOrder !== filters.sortOrder;

    setFilters({
      ...newFilters,
      page: isFilterReset ? 1 : newFilters.page,
    });
  }

  function handlePageChange(newPage) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  function handleLimitChange(newLimit) {
    setFilters((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }

  // ── Create / Edit ─────────────────────────────────────────────────────────
  function openCreate() { setEditingProject(null); setFormOpen(true); }
  function openEdit(project) { setEditingProject(project); setFormOpen(true); }

  async function handleFormSubmit(formData) {
    setIsSubmitting(true);
    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject.id, formData);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        fetchStats();
        addToast(`"${updated.projectName}" updated`, 'success');
      } else {
        await api.createProject(formData);
        fetchProjects();
        fetchStats();
        addToast(`Project created`, 'success');
      }
      setFormOpen(false);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function openDelete(project) { setDeleteTarget(project); }

  async function handleDelete(id) {
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      fetchProjects();
      fetchStats();
      addToast('Project deleted', 'info');
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="state-container" style={{ minHeight: '100vh' }}>
        <div className="state-icon" aria-hidden="true" style={{ fontSize: '2rem' }}>⚡</div>
        <p className="state-subtitle">Loading…</p>
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <LoginPage onAuthenticated={handleAuthenticated} />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const displayedCount = projects.length;
  const totalCount = pagination ? pagination.total : projects.length;

  return (
    <>
      <Header
        stats={stats}
        projects={projects}
        user={currentUser}
        onCreateClick={openCreate}
        onLogout={handleLogout}
      />

      <div className="main-layout">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          count={displayedCount}
          total={totalCount}
        />

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          error={fetchError}
          onEdit={openEdit}
          onDelete={openDelete}
        />

        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>

      <ProjectFormModal
        isOpen={formOpen}
        project={editingProject}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        project={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
