import apiClient from './apiClient';
import { mockCourses } from '../data/mockData';
import { Course } from '../types';

export const courseApi = {
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get('/api/courses');
      return response.data;
    } catch (err) {
      console.warn('Backend /api/courses unavailable, serving mock courses.', err);
      return mockCourses;
    }
  },

  getCourseById: async (courseId: string): Promise<Course | null> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}`);
      return response.data;
    } catch (err) {
      const found = mockCourses.find((c) => c.id === courseId);
      return found || mockCourses[0];
    }
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    try {
      const response = await apiClient.post('/api/courses', courseData);
      return response.data;
    } catch (err) {
      const newCourse: Course = {
        id: `c_${Date.now()}`,
        title: courseData.title || 'Untitled AI Course',
        code: courseData.code || 'CS-101',
        subject: courseData.subject || 'General',
        department: courseData.department || 'Computer Science',
        semester: courseData.semester || 'Fall 2026',
        description: courseData.description || '',
        learningObjectives: courseData.learningObjectives || [],
        workflowStatus: {
          create: 'completed',
          knowledge: 'in_progress',
          builder: 'pending',
          review: 'pending',
          publish: 'pending',
          students: 'pending',
          analytics: 'pending',
          improve: 'pending',
        },
        overallProgress: 15,
        studentsCount: 0,
        contentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCourses.unshift(newCourse);
      return newCourse;
    }
  },

  updateCourseWorkflowStatus: async (
    courseId: string,
    workflowStatus: Partial<Course['workflowStatus']>
  ): Promise<Course> => {
    try {
      const response = await apiClient.patch(`/api/courses/${courseId}/workflow`, { workflowStatus });
      return response.data;
    } catch (err) {
      const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
      course.workflowStatus = { ...course.workflowStatus, ...workflowStatus };
      return course;
    }
  },
};

export default courseApi;
