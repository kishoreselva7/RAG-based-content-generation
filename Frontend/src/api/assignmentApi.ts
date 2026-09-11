import apiClient from './apiClient';
import { mockAssignments } from '../data/mockData';
import { Assignment } from '../types';

export const assignmentApi = {
  getAssignments: async (courseId: string): Promise<Assignment[]> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/assignments`);
      return response.data;
    } catch (err) {
      return mockAssignments.filter((a) => a.courseId === courseId) || mockAssignments;
    }
  },

  createAssignment: async (data: {
    courseId: string;
    contentId: string;
    title: string;
    assignedToGroups: string[];
    dueDate: string;
    maxAttempts: number;
  }): Promise<Assignment> => {
    try {
      const response = await apiClient.post(`/api/courses/${data.courseId}/assignments`, data);
      return response.data;
    } catch (err) {
      const newAsg: Assignment = {
        id: `asg_${Date.now()}`,
        courseId: data.courseId,
        contentId: data.contentId,
        title: data.title,
        assignedToGroups: data.assignedToGroups,
        dueDate: data.dueDate,
        maxAttempts: data.maxAttempts,
        submittedCount: 0,
        pendingCount: 248,
        totalAssigned: 248,
        createdAt: new Date().toISOString(),
      };
      mockAssignments.unshift(newAsg);
      return newAsg;
    }
  },
};

export default assignmentApi;
