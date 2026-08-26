import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pollibondhu_token') || '');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchCurrentUser = async (token) => {
    if (!token) {
      setCurrentUser(null);
      setLoadingAuth(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        localStorage.removeItem('pollibondhu_token');
        setAuthToken('');
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Auth fetch error:", e);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchCurrentUser(authToken);
    } else {
      setLoadingAuth(false);
    }
  }, [authToken]);

  const login = (user, token) => {
    localStorage.setItem('pollibondhu_token', token);
    setAuthToken(token);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('pollibondhu_token');
    setAuthToken('');
    setCurrentUser(null);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isOfficer = currentUser && (currentUser.role === 'officer' || currentUser.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authToken,
        isOfficer,
        loadingAuth,
        isAuthModalOpen,
        authModalTab,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
