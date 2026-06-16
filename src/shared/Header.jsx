import { Link } from 'react-router';
import Logoff from '../features/Logoff.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from './Navigation.jsx';

export default function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">T</span>
        <span>Todo List</span>
      </Link>
      <Navigation />
      {isAuthenticated && <Logoff />}
    </header>
  );
}
