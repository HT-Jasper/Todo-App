import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main>
      <h2>404 - Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <nav>
        <ul>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/todos">Todos</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}

export default NotFoundPage;
