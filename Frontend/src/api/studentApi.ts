import apiClient from './apiClient';
import { mockStudents } from '../data/mockData';
import { Student } from '../types';

export const studentApi = {
  getStudentsByCourse: async (courseId: string): Promise<Student[]> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/students`);
      return response.data;
    } catch (err) {
      return mockStudents.filter((s) => s.enrolledCourses.includes(courseId)) || mockStudents;
    }
  },

  getAllStudents: async (): Promise<Student[]> => {
    try {
      const response = await apiClient.get('/api/students');
      return response.data;
    } catch (err) {
      return mockStudents;
    }
  },

  enrollStudent: async (courseId: string, studentEmail: string): Promise<Student> => {
    try {
      const response = await apiClient.post(`/api/courses/${courseId}/students/enroll`, { email: studentEmail });
      return response.data;
    } catch (err) {
      const newStudent: Student = {
        id: `s_${Date.now()}`,
        name: studentEmail.split('@')[0].replace('.', ' '),
        email: studentEmail,
        progress: 0,
        averageScore: 0,
        lastActive: 'Just enrolled',
        status: 'On Track',
        enrolledCourses: [courseId],
      };
      mockStudents.unshift(newStudent);
      return newStudent;
    }
  },
};

export default studentApi;
