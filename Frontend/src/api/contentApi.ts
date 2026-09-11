import apiClient from './apiClient';
import { mockContents, mockUnits } from '../data/mockData';
import { GeneratedContent, GenerationConfig, Unit } from '../types';

export const contentApi = {
  getCourseUnits: async (courseId: string): Promise<Unit[]> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/units`);
      return response.data;
    } catch (err) {
      console.error("API Error getCourseUnits:", err);
      return [];
    }
  },

  getCourseContents: async (courseId: string): Promise<GeneratedContent[]> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/content`);
      return response.data;
    } catch (err) {
      console.error("API Error getCourseContents:", err);
      return [];
    }
  },

  getContentById: async (contentId: string): Promise<GeneratedContent | null> => {
    try {
      const response = await apiClient.get(`/api/content/${contentId}`);
      return response.data;
    } catch (err) {
      for (const courseId in mockContents) {
        const found = mockContents[courseId].find((c) => c.id === contentId);
        if (found) return found;
      }
      return mockContents['c_ml_101']?.[0] || null;
    }
  },

  generateAIContent: async (config: GenerationConfig): Promise<GeneratedContent> => {
    try {
      const response = await apiClient.post(`/api/courses/${config.courseId}/generate`, config);
      return response.data;
    } catch (err) {
      const titleMap: Record<string, string> = {
        lecture_notes: 'AI Generated Lecture Notes',
        quiz: 'Topic Review & Quiz',
        assignment: 'Homework Assignment & Problem Set',
        question_bank: 'Practice Question Bank',
        flashcards: 'Revision Flashcards Set',
        ppt: 'Lecture Presentation Deck',
        study_material: 'Summary Study Guide',
      };

      const newContent: GeneratedContent = {
        id: `cnt_${Date.now()}`,
        courseId: config.courseId,
        unitId: config.unitId,
        topicId: config.topicId,
        title: `${titleMap[config.contentType] || 'AI Content'} (${config.difficulty})`,
        type: config.contentType,
        difficulty: config.difficulty,
        status: 'needs_review',
        contentBody: `# ${titleMap[config.contentType]}\n\n## 1. Core Principles\nGenerated directly from course syllabus and reference notes.\n\n### Key Concepts\n- Concept A: Ground truth formulation\n- Concept B: Algorithm step-by-step evaluation\n\n## 2. Practical Examples\n- **Case Study**: High-dimensional variance reduction\n- **Implementation**: Evaluate loss reduction curves across epochs.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!mockContents[config.courseId]) {
        mockContents[config.courseId] = [];
      }
      mockContents[config.courseId].unshift(newContent);
      return newContent;
    }
  },

  updateContentStatus: async (
    contentId: string,
    status: GeneratedContent['status'],
    updatedBody?: string
  ): Promise<GeneratedContent> => {
    try {
      const response = await apiClient.patch(`/api/content/${contentId}`, { status, contentBody: updatedBody });
      return response.data;
    } catch (err) {
      for (const courseId in mockContents) {
        const found = mockContents[courseId].find((c) => c.id === contentId);
        if (found) {
          found.status = status;
          if (updatedBody) found.contentBody = updatedBody;
          found.updatedAt = new Date().toISOString();
          return found;
        }
      }
      throw new Error('Content item not found');
    }
  },

  publishCourseContents: async (
    courseId: string,
    selectedContentIds: string[]
  ): Promise<{ success: boolean; publishedCount: number }> => {
    try {
      const response = await apiClient.post(`/api/courses/${courseId}/publish`, { selectedContentIds });
      return response.data;
    } catch (err) {
      const list = mockContents[courseId] || [];
      list.forEach((c) => {
        if (selectedContentIds.includes(c.id)) {
          c.status = 'published';
        }
      });
      return { success: true, publishedCount: selectedContentIds.length };
    }
  },
};

export default contentApi;
