"use client"

import React, { createContext, useEffect, useState } from 'react';
import { AuthContextProps, AuthProviderProps } from '@/types/auth';

export const AuthContext = createContext<AuthContextProps>({
  authUser: false,
  login: () => {},
  logout: () => {}
});

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const [authUser, setAuthUser] = useState<boolean|null>(null);

  useEffect(() => {
    const initialAuthUser = !!localStorage.getItem('isAuth');
    setAuthUser(initialAuthUser);
  }, []);

  const login = () => {
    localStorage.setItem("isAuth", 'true')
    setAuthUser(true);
  };

  const logout = () => {
    localStorage.removeItem("isAuth")
    setAuthUser(false);
  };

  if (authUser === null) {
    return (
     <div className='flex items-center justify-center h-screen'>Loading...</div>
    )
  }

  return (
    <AuthContext.Provider value={{ authUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider