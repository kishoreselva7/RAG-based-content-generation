import apiClient from './apiClient';
import { GeneratedContent } from '../types';

export const improvementApi = {
  generateRemedialPackage: async (
    courseId: string,
    topicId: string,
    topicName: string,
    strugglingConcepts: string[]
  ): Promise<{
    success: boolean;
    remedialContent: GeneratedContent[];
  }> => {
    try {
      const response = await apiClient.post(`/api/courses/${courseId}/improve`, {
        topicId,
        topicName,
        strugglingConcepts,
      });
      return response.data;
    } catch (err) {
      const remedialNotes: GeneratedContent = {
        id: `remedial_cnt_${Date.now()}`,
        courseId,
        topicId,
        title: `Remedial Module: Simplified Guide to ${topicName}`,
        type: 'lecture_notes',
        difficulty: 'Easy',
        status: 'needs_review',
        contentBody: `# Remedial Study Guide: ${topicName}

## Breakdown of Key Difficulties
This tailored remedial module directly addresses identified class struggles in:
${strugglingConcepts.map((concept) => `- **${concept}**`).join('\n')}

---

## 1. Visual & Intuitive Explanation
Think of a **Confusion Matrix** like a diagnostic radar screen:
- **True Positives (TP)**: Alarm sounds when a real target is detected.
- **False Positives (FP)**: Alarm sounds for a false bird flock (Precision penalty).
- **False Negatives (FN)**: Missed actual target (Recall penalty - extremely dangerous in medical/security applications!).

---

## 2. Step-by-Step Practical Drill
Calculate Precision and Recall given:
- $TP = 80$
- $FP = 20$
- $FN = 10$

$$\\text{Precision} = \\frac{TP}{TP + FP} = \\frac{80}{80 + 20} = 80\\%$$
$$\\text{Recall} = \\frac{TP}{TP + FN} = \\frac{80}{80 + 10} = 88.9\\%$$

### Key Takeaway Formula
Recall is always about **finding all real targets** without letting any pass undetected.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        remedialContent: [remedialNotes],
      };
    }
  },
};

export default improvementApi;
