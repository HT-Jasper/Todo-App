export default function AboutPage() {
  return (
    <main>
      <h2>About This Todo App</h2>
      <p>
        This app helps users manage todo tasks with authentication, sorting,
        searching, editing, and completion tracking.
      </p>

      <section>
        <h3>Features</h3>
        <ul>
          <li>User login and logout</li>
          <li>Protected todo and profile pages</li>
          <li>Add, edit, complete, sort, and search todos</li>
          <li>URL-based todo status filtering</li>
        </ul>
      </section>

      <section>
        <h3>Technologies Used</h3>
        <ul>
          <li>React</li>
          <li>React Router</li>
          <li>Vite</li>
        </ul>
      </section>
    </main>
  );
}