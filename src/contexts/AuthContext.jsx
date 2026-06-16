import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'todoAuth';

function readStoredAuth() {
  try {
    const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : { email: '', token: '' };
  } catch {
    return { email: '', token: '' };
  }
}

function writeStoredAuth(email, token) {
  try {
    if (token) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ email, token })
      );
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    return;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => readStoredAuth().email);
  const [token, setToken] = useState(() => readStoredAuth().token);

  const updateAuth = (nextEmail, nextToken) => {
    setEmail(nextEmail);
    setToken(nextToken);
    writeStoredAuth(nextEmail, nextToken);
  };

  const login = async (userEmail, password) => {
    try {
      const response = await fetch('/api/users/logon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          password,
        }),
      });

      const data = await response.json();

      if (response.status === 200 && data.name && data.csrfToken) {
        updateAuth(data.name, data.csrfToken);
        return { success: true };
      }

      return {
        success: false,
        error: 'Authentication failed. Check your email and password.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to log in right now. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/users/logoff', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
        });
      }

      updateAuth('', '');
      return { success: true };
    } catch {
      updateAuth('', '');

      return {
        success: false,
        error: 'You were signed out locally, but the server did not respond.',
      };
    }
  };

  const value = {
    email,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
