import { useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const TABS = { login: 'login', register: 'register' };

export default function LoginPage({ onAuthenticated }) {
  const [tab,         setTab]         = useState(TABS.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError,    setApiError]    = useState('');

  // Login form
  const [loginForm,   setLoginForm]   = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  // Register form
  const [regForm,   setRegForm]   = useState({ name: '', email: '', password: '' });
  const [regErrors, setRegErrors] = useState({});

  // Clear errors when switching tabs
  useEffect(() => {
    setApiError('');
    setLoginErrors({});
    setRegErrors({});
  }, [tab]);

  // ── Login ─────────────────────────────────────────────────────────────────
  function validateLoginForm() {
    const errs = {};
    if (!loginForm.email.trim())    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = 'Enter a valid email';
    if (!loginForm.password.trim()) errs.password = 'Password is required';
    return errs;
  }

  async function handleLogin(e) {
    e.preventDefault();
    const errs = validateLoginForm();
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }

    setIsSubmitting(true);
    setApiError('');
    try {
      const { token, user } = await authApi.login(loginForm.email, loginForm.password);
      onAuthenticated(token, user);
    } catch (err) {
      if (err.field) setLoginErrors({ [err.field]: err.message });
      else setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLoginChange(key, value) {
    setLoginForm((f) => ({ ...f, [key]: value }));
    setLoginErrors((e) => ({ ...e, [key]: undefined }));
    setApiError('');
  }

  // ── Register ──────────────────────────────────────────────────────────────
  function validateRegForm() {
    const errs = {};
    if (!regForm.name.trim())    errs.name     = 'Name is required';
    if (!regForm.email.trim())   errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errs.email = 'Enter a valid email';
    if (!regForm.password)       errs.password = 'Password is required';
    else if (regForm.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  }

  async function handleRegister(e) {
    e.preventDefault();
    const errs = validateRegForm();
    if (Object.keys(errs).length) { setRegErrors(errs); return; }

    setIsSubmitting(true);
    setApiError('');
    try {
      const { token, user } = await authApi.register(regForm.name, regForm.email, regForm.password);
      onAuthenticated(token, user);
    } catch (err) {
      if (err.field) setRegErrors({ [err.field]: err.message });
      else setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRegChange(key, value) {
    setRegForm((f) => ({ ...f, [key]: value }));
    setRegErrors((e) => ({ ...e, [key]: undefined }));
    setApiError('');
  }

  // ── Demo login shortcut ───────────────────────────────────────────────────
  async function handleDemoLogin() {
    setIsSubmitting(true);
    setApiError('');
    try {
      const { token, user } = await authApi.login('admin@projectflow.io', 'password123');
      onAuthenticated(token, user);
    } catch (err) {
      setApiError(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      {/* Background decorations */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg-blob login-bg-blob-1" />
        <div className="login-bg-blob login-bg-blob-2" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-card" role="main">
        {/* Logo */}
        <div className="login-brand" aria-label="ProjectFlow">
          <div className="login-logo" aria-hidden="true">PF</div>
          <div>
            <div className="login-app-name">ProjectFlow</div>
            <div className="login-app-tagline">Client Project Tracker</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="login-tabs" role="tablist" aria-label="Authentication mode">
          <button
            id="tab-login"
            role="tab"
            aria-selected={tab === TABS.login}
            className={`login-tab${tab === TABS.login ? ' active' : ''}`}
            onClick={() => setTab(TABS.login)}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            role="tab"
            aria-selected={tab === TABS.register}
            className={`login-tab${tab === TABS.register ? ' active' : ''}`}
            onClick={() => setTab(TABS.register)}
          >
            Create Account
          </button>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="login-error" role="alert" aria-live="assertive">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {apiError}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {tab === TABS.login && (
          <form
            id="login-form"
            className="login-form"
            onSubmit={handleLogin}
            noValidate
            aria-label="Sign in form"
          >
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${loginErrors.email ? ' error' : ''}`}
                value={loginForm.email}
                onChange={(e) => handleLoginChange('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-required="true"
                aria-describedby={loginErrors.email ? 'err-login-email' : undefined}
              />
              {loginErrors.email && (
                <span id="err-login-email" className="field-error" role="alert">
                  {loginErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className={`form-input${loginErrors.password ? ' error' : ''}`}
                value={loginForm.password}
                onChange={(e) => handleLoginChange('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                aria-required="true"
                aria-describedby={loginErrors.password ? 'err-login-pwd' : undefined}
              />
              {loginErrors.password && (
                <span id="err-login-pwd" className="field-error" role="alert">
                  {loginErrors.password}
                </span>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === TABS.register && (
          <form
            id="register-form"
            className="login-form"
            onSubmit={handleRegister}
            noValidate
            aria-label="Create account form"
          >
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className={`form-input${regErrors.name ? ' error' : ''}`}
                value={regForm.name}
                onChange={(e) => handleRegChange('name', e.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                required
                aria-required="true"
                aria-describedby={regErrors.name ? 'err-reg-name' : undefined}
              />
              {regErrors.name && (
                <span id="err-reg-name" className="field-error" role="alert">
                  {regErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input${regErrors.email ? ' error' : ''}`}
                value={regForm.email}
                onChange={(e) => handleRegChange('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-required="true"
                aria-describedby={regErrors.email ? 'err-reg-email' : undefined}
              />
              {regErrors.email && (
                <span id="err-reg-email" className="field-error" role="alert">
                  {regErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input
                id="reg-password"
                type="password"
                className={`form-input${regErrors.password ? ' error' : ''}`}
                value={regForm.password}
                onChange={(e) => handleRegChange('password', e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
                aria-required="true"
                aria-describedby={regErrors.password ? 'err-reg-pwd' : undefined}
              />
              {regErrors.password && (
                <span id="err-reg-pwd" className="field-error" role="alert">
                  {regErrors.password}
                </span>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Demo shortcut */}
        <div className="login-divider" aria-hidden="true">
          <span>or</span>
        </div>
        <button
          id="demo-login-btn"
          type="button"
          className="btn btn-secondary login-demo"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          title="Login with the pre-seeded demo account"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Continue with Demo Account
        </button>

        <p className="login-hint">
          Demo: <code>admin@projectflow.io</code> / <code>password123</code>
        </p>
      </div>
    </div>
  );
}
