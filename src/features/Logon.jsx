import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  getPasswordError,
  prepareEmail,
} from '../utils/authValidation.js';

export default function Logon() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  const handleSubmit = async (event) => {
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
  };

  return (
    <section className="auth-panel">
      <h2>Log On</h2>

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
  );
}
