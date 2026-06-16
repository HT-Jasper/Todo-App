export default function AboutPage() {
  return (
    <main className="page-shell content-page">
      <section className="page-heading">
        <p className="eyebrow">About</p>
        <h2>About This Todo App</h2>
        <p>
          A focused task manager with authentication, sorting, searching,
          editing, deletion, and completion tracking.
        </p>
      </section>

      <section className="content-section">
        <h3>Features</h3>
        <ul>
          <li>User login and logout</li>
          <li>Protected todo and profile pages</li>
          <li>Add, edit, delete, complete, sort, and search todos</li>
          <li>URL-based todo status filtering</li>
        </ul>
      </section>

      <section className="content-section">
        <h3>Technologies Used</h3>
        <ul>
          <li>React</li>
          <li>React Router</li>
          <li>Vite</li>
          <li>DOMPurify</li>
        </ul>
      </section>
    </main>
  );
}
