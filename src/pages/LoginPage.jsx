import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  getPasswordError,
  prepareEmail,
} from '../utils/authValidation.js';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingOn, setIsLoggingOn] = useState(false);
  const from = location.state?.from?.pathname || '/todos';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  async function handleSubmit(event) {
    event.preventDefault();

    const emailResult = prepareEmail(email);
    const passwordError = getPasswordError(password);

    if (emailResult.error || passwordError) {
      setAuthError(emailResult.error || passwordError);
      return;
    }

    setIsLoggingOn(true);
    setAuthError('');

    const result = await login(emailResult.email, password);

    if (!result.success) {
      setAuthError(result.error);
    }

    setIsLoggingOn(false);
  }

  return (
    <main className="page-shell auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Welcome back</p>
        <h2>Log On</h2>
        <p className="muted">
          Sign in to manage your tasks, filters, and completion progress.
        </p>

        {authError && (
          <p className="form-error" role="alert">
            {authError}
          </p>
        )}

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="field">
          <label htmlFor="email">Email</label>
          <input
            autoComplete="email"
            id="email"
            maxLength={EMAIL_MAX_LENGTH}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          </div>

          <div className="field">
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            maxLength={PASSWORD_MAX_LENGTH}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          </div>

          <button type="submit" disabled={isLoggingOn}>
          {isLoggingOn ? 'Logging in...' : 'Log On'}
          </button>
        </form>
      </section>
    </main>
  );
}
