import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TeacherProfile } from '../types';
import { authApi } from '../api/authApi';
import { mockTeacherProfile } from '../data/mockData';

interface AuthContextType {
  teacher: TeacherProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(mockTeacherProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('edugen_auth_token');
    if (token) {
      authApi
        .getCurrentTeacherProfile()
        .then((profile) => {
          setTeacher(profile);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // If token fails, default to mock profile for seamless demo
          setTeacher(mockTeacherProfile);
          setIsAuthenticated(true);
        });
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.token) {
        setTeacher(res.teacher || mockTeacherProfile);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (err) {
      setTeacher(mockTeacherProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
  };

  const logout = async () => {
    await authApi.logout();
    setTeacher(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ teacher, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
