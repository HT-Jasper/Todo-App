import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProfilePage() {
  const { email: name, token, isAuthenticated } = useAuth();
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTodoStats() {
      if (!token) return;

      try {
        setIsLoading(true);
        setError('');

        const options = {
          method: 'GET',
          headers: { 'X-CSRF-TOKEN': token },
          credentials: 'include',
        };

        const response = await fetch('/api/tasks', options);

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Unable to load statistics.');
        }

        const data = await response.json();
        const todos = Array.isArray(data) ? data : data.tasks || [];
        const total = todos.length;
        const completed = todos.filter(
          (todo) => todo.isCompleted ?? todo.completed
        ).length;
        const active = total - completed;

        setTodoStats({ total, completed, active });
      } catch {
        setError('We could not load your statistics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTodoStats();
  }, [token]);

  const completionPercentage =
    todoStats.total > 0
      ? Math.round((todoStats.completed / todoStats.total) * 100)
      : 0;

  return (
    <main className="page-shell content-page">
      <section className="page-heading">
        <p className="eyebrow">Account</p>
        <h2>Profile</h2>
      </section>

      <section className="content-section">
        <h3>Account Information</h3>
        <p>Name: {name || 'Unknown user'}</p>
        <p>Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
      </section>

      <section className="content-section">
        <h3>Todo Statistics</h3>

        {isLoading && <p className="loading-state">Loading statistics...</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <div className="stats-grid">
            <p>
              <span>Total todos</span>
              <strong>{todoStats.total}</strong>
            </p>
            <p>
              <span>Completed</span>
              <strong>{todoStats.completed}</strong>
            </p>
            <p>
              <span>Active</span>
              <strong>{todoStats.active}</strong>
            </p>
            {todoStats.total > 0 && (
              <p>
                <span>Completion</span>
                <strong>{completionPercentage}%</strong>
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
