import apiClient from './apiClient';
import { mockTeacherProfile } from '../data/mockData';
import { TeacherProfile } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      if (response.data?.token) {
        localStorage.setItem('edugen_auth_token', response.data.token);
      }
      return response.data;
    } catch (err) {
      console.warn('Backend login endpoint unavailable, using demo profile credentials.', err);
      // Fallback for UI demonstration
      const token = 'demo_jwt_token_' + Date.now();
      localStorage.setItem('edugen_auth_token', token);
      return {
        success: true,
        token,
        teacher: mockTeacherProfile,
      };
    }
  },

  getCurrentTeacherProfile: async (): Promise<TeacherProfile> => {
    try {
      const response = await apiClient.get('/api/auth/profile');
      return response.data;
    } catch (err) {
      return mockTeacherProfile;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (e) {
      // Ignore fallback logout error
    } finally {
      localStorage.removeItem('edugen_auth_token');
    }
  },
};

export default authApi;
