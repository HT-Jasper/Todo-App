import Header from './shared/Header.jsx';
import Logon from './features/Logon.jsx';
import TodosPage from './features/Todos/TodosPage.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header />
      {isAuthenticated ? <TodosPage /> : <Logon />}
    </>
  );
}