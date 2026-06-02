import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Logoff() {
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOff, setIsLoggingOff] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOff(true);
    setLogoutError('');

    const result = await logout();

    if (!result.success) {
      setLogoutError(result.error);
    }

    setIsLoggingOff(false);
  };

  return (
    <div>
      {logoutError && <p>{logoutError}</p>}
      <button type="button" onClick={handleLogout} disabled={isLoggingOff}>
        {isLoggingOff ? 'Logging off...' : 'Log Off'}
      </button>
    </div>
  );
}
