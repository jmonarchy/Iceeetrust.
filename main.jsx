import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

// Fixed admin accounts — no self-registration allowed.
const ALLOWED_ADMINS = [
  'jchaula@iceeetrust.org',
  'suziedon@iceeetrust.org',
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      const model = pb.authStore.model;
      // Only restore session for allowed admins
      if (model?.email && ALLOWED_ADMINS.includes(model.email.toLowerCase())) {
        setCurrentUser(model);
      } else {
        pb.authStore.clear();
      }
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!ALLOWED_ADMINS.includes(normalizedEmail)) {
      throw new Error('Access denied. This account is not authorised.');
    }

    const authData = await pb.collection('users').authWithPassword(
      normalizedEmail,
      password,
      { $autoCancel: false }
    );
    setCurrentUser(authData.record);
    return authData;
  };

  // signup is intentionally removed — accounts are fixed and pre-provisioned.

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const isAuthenticated = Boolean(currentUser);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, initialLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};