import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated) {
    return (
      <main className="page-shell">
        <p>Redirecting to login...</p>
      </main>
    );
  }

  return children;
}
