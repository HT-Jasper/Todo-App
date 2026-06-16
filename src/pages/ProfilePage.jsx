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
          throw new Error('Failed to fetch todos');
        }

        const data = await response.json();
        const todos = Array.isArray(data) ? data : data.tasks || [];
        const total = todos.length;
        const completed = todos.filter((todo) => todo.isCompleted).length;
        const active = total - completed;

        setTodoStats({ total, completed, active });
      } catch (err) {
        setError(`Error loading statistics: ${err.message}`);
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
    <main>
      <h2>Profile</h2>

      <section>
        <h3>Account Information</h3>
        <p>Name: {name || 'Unknown user'}</p>
        <p>Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
      </section>

      <section>
        <h3>Todo Statistics</h3>

        {isLoading && <p>Loading statistics...</p>}
        {error && <p>{error}</p>}

        {!isLoading && !error && (
          <div>
            <p>Total todos: {todoStats.total}</p>
            <p>Completed todos: {todoStats.completed}</p>
            <p>Active todos: {todoStats.active}</p>
            {todoStats.total > 0 && (
              <p>Completion percentage: {completionPercentage}%</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}