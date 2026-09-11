import apiClient from './apiClient';
import { mockDocuments } from '../data/mockData';
import { KnowledgeDocument } from '../types';

export const knowledgeApi = {
  getDocuments: async (courseId: string): Promise<KnowledgeDocument[]> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/knowledge`);
      return response.data;
    } catch (err) {
      return mockDocuments[courseId] || mockDocuments['c_ml_101'] || [];
    }
  },

  uploadDocument: async (
    courseId: string,
    file: File,
    category: KnowledgeDocument['category']
  ): Promise<KnowledgeDocument> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await apiClient.post(`/api/courses/${courseId}/knowledge/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let fileType: KnowledgeDocument['fileType'] = 'pdf';
      if (extension === 'docx') fileType = 'docx';
      else if (extension === 'txt') fileType = 'txt';
      else if (extension === 'ppt' || extension === 'pptx') fileType = 'ppt';

      const newDoc: KnowledgeDocument = {
        id: `doc_${Date.now()}`,
        courseId,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType,
        category,
        status: 'processing',
        chunkCount: Math.floor(Math.random() * 150) + 50,
        uploadedAt: new Date().toISOString(),
      };

      if (!mockDocuments[courseId]) {
        mockDocuments[courseId] = [];
      }
      mockDocuments[courseId].unshift(newDoc);
      return newDoc;
    }
  },

  processKnowledgeDocument: async (docId: string): Promise<{ success: boolean; status: string }> => {
    try {
      const response = await apiClient.post(`/api/knowledge/${docId}/process`);
      return response.data;
    } catch (err) {
      return { success: true, status: 'processed' };
    }
  },

  deleteDocument: async (docId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/knowledge/${docId}`);
      return true;
    } catch (err) {
      Object.keys(mockDocuments).forEach((courseId) => {
        mockDocuments[courseId] = mockDocuments[courseId].filter((d) => d.id !== docId);
      });
      return true;
    }
  },
};

export default knowledgeApi;
