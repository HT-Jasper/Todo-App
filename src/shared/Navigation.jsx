import { NavLink } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <ul>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            About
          </NavLink>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <NavLink
                to="/todos"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                Todos
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                Profile
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Login
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
