import { useState } from 'react';
import Header from './shared/Header.jsx';
import Logon from './features/Logon.jsx';
import TodosPage from './features/Todos/TodosPage.jsx';

export default function App() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  return (
    <>
      <Header
        token={token}
        onSetToken={setToken}
        onSetEmail={setEmail}
      />

      {token 
      ? (<TodosPage token={token} />) 
      : (
        <Logon
          onSetEmail={setEmail}
          onSetToken={setToken}
        />
      )}
    </>
  );
}