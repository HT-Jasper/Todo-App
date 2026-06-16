import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main className="page-shell content-page">
      <section className="page-heading">
        <p className="eyebrow">404</p>
        <h2>Page Not Found</h2>
      </section>
      <p>The page you requested does not exist.</p>
      <nav className="quick-links" aria-label="Helpful links">
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
