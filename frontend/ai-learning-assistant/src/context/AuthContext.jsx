import { useState } from 'react';
import AuthContext from './authContext';

const readStoredAuth = () => {
  if (typeof window === 'undefined') return { token: null, user: null };

  try {
    const token = window.localStorage.getItem('token');
    const storedUser = window.localStorage.getItem('user');
    return token && storedUser
      ? { token, user: JSON.parse(storedUser) }
      : { token: null, user: null };
  } catch {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    return { token: null, user: null };
  }
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStoredAuth);
  const isAuthenticated = Boolean(auth.token && auth.user);

  const login = (user, token) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
    setAuth({ user, token });
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    setAuth({ token: null, user: null });
    window.location.assign('/login');
  };

  const updateUser = (updatedUserData) => {
    setAuth((currentAuth) => {
      const user = { ...currentAuth.user, ...updatedUserData };
      window.localStorage.setItem('user', JSON.stringify(user));
      return { ...currentAuth, user };
    });
  };

  const value = {
    user: auth.user,
    loading: false,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
