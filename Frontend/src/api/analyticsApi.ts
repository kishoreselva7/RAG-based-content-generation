import apiClient from './apiClient';
import { mockAnalytics } from '../data/mockData';
import { CourseAnalytics } from '../types';

export const analyticsApi = {
  getCourseAnalytics: async (courseId: string): Promise<CourseAnalytics> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/analytics`);
      return response.data;
    } catch (err) {
      return mockAnalytics[courseId] || mockAnalytics['c_ml_101'];
    }
  },
};

export default analyticsApi;
