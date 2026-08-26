import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  useEffect(() => {
    const storedToken = localStorage.getItem('pollibondhu_token');
    const storedUser = localStorage.getItem('pollibondhu_user');
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('pollibondhu_user');
      }
    }
  }, []);

  const login = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('pollibondhu_token', token);
    localStorage.setItem('pollibondhu_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('pollibondhu_token');
    localStorage.removeItem('pollibondhu_user');
  };

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('pollibondhu_user', JSON.stringify(updatedUser));
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isOfficer = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authToken,
        isOfficer,
        login,
        logout,
        updateUser,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
