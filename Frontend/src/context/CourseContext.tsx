import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, WorkflowStepId, StepStatus } from '../types';
import { courseApi } from '../api/courseApi';
import { mockCourses } from '../data/mockData';

interface CourseContextType {
  courses: Course[];
  activeCourse: Course | null;
  isLoading: boolean;
  selectCourse: (courseId: string) => void;
  refreshCourses: () => Promise<void>;
  createCourse: (data: Partial<Course>) => Promise<Course>;
  updateWorkflowStep: (courseId: string, stepId: WorkflowStepId, status: StepStatus) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [activeCourse, setActiveCourse] = useState<Course | null>(mockCourses[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCourses = async () => {
    setIsLoading(true);
    try {
      const fetched = await courseApi.getCourses();
      setCourses(fetched);
      if (fetched.length > 0 && !activeCourse) {
        setActiveCourse(fetched[0]);
      }
    } catch (e) {
      setCourses(mockCourses);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  const selectCourse = (courseId: string) => {
    const found = courses.find((c) => c.id === courseId);
    if (found) {
      setActiveCourse(found);
    } else {
      courseApi.getCourseById(courseId).then((c) => {
        if (c) setActiveCourse(c);
      });
    }
  };

  const createCourse = async (data: Partial<Course>): Promise<Course> => {
    const newCourse = await courseApi.createCourse(data);
    setCourses((prev) => [newCourse, ...prev]);
    setActiveCourse(newCourse);
    return newCourse;
  };

  const updateWorkflowStep = async (courseId: string, stepId: WorkflowStepId, status: StepStatus) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedWorkflow = { ...c.workflowStatus, [stepId]: status };
          // calculate rough percentage based on completed steps
          const steps = Object.values(updatedWorkflow);
          const completedCount = steps.filter((s) => s === 'completed').length;
          const overallProgress = Math.round((completedCount / steps.length) * 100);
          return { ...c, workflowStatus: updatedWorkflow, overallProgress };
        }
        return c;
      })
    );

    if (activeCourse && activeCourse.id === courseId) {
      const updatedWorkflow = { ...activeCourse.workflowStatus, [stepId]: status };
      const steps = Object.values(updatedWorkflow);
      const completedCount = steps.filter((s) => s === 'completed').length;
      const overallProgress = Math.round((completedCount / steps.length) * 100);
      setActiveCourse({ ...activeCourse, workflowStatus: updatedWorkflow, overallProgress });
    }

    await courseApi.updateCourseWorkflowStatus(courseId, { [stepId]: status });
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        activeCourse,
        isLoading,
        selectCourse,
        refreshCourses,
        createCourse,
        updateWorkflowStep,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error('useCourse must be used within CourseProvider');
  }
  return ctx;
};
