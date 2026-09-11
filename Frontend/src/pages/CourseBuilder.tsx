import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { useToast } from '../context/ToastContext';
import { contentApi } from '../api/contentApi';
import { Unit, ContentType, GenerationConfig } from '../types';
import { WorkflowStepper } from '../components/layout/WorkflowStepper';
import { CourseHeader } from '../components/layout/CourseHeader';
import { UnitTopicTree } from '../components/builder/UnitTopicTree';
import { AIGenerationModal } from '../components/builder/AIGenerationModal';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const CourseBuilder: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { activeCourse, selectCourse, updateWorkflowStep } = useCourse();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [units, setUnits] = useState<Unit[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>();
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('lecture_notes');

  const effectiveCourseId = courseId || activeCourse?.id || 'c_ml_101';

  useEffect(() => {
    if (effectiveCourseId) {
      selectCourse(effectiveCourseId);
      contentApi.getCourseUnits(effectiveCourseId).then((u) => setUnits(u));
    }
  }, [effectiveCourseId]);

  const handleOpenModal = (unitId: string, topicId: string, type: ContentType) => {
    setSelectedUnitId(unitId);
    setSelectedTopicId(topicId);
    setSelectedContentType(type);
    setModalOpen(true);
  };

  const handleGenerateUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedTopicId(undefined);
    setSelectedContentType('lecture_notes');
    setModalOpen(true);
  };

  const handleGenerateAI = async (config: GenerationConfig) => {
    const newContent = await contentApi.generateAIContent(config);
    await updateWorkflowStep(effectiveCourseId, 'builder', 'completed');
    addToast('AI Content Generated ✓', 'Redirecting to Content Review workspace...', 'success');

    // Section 12 & 33 UX principle:
    // Move teacher directly to Review step
    navigate(`/courses/${effectiveCourseId}/review`);
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 space-y-6">
      <WorkflowStepper activeStep="builder" />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {activeCourse && <CourseHeader course={activeCourse} currentStep="builder" />}

        {/* AI Builder Banner */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Course Builder Engine</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Grounded on your uploaded knowledge base:
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium text-emerald-300 mt-2">
                <span className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Syllabus
                </span>
                <span className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Notes
                </span>
                <span className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Question Papers
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleGenerateUnit('u_1')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Batch Generate Course Content</span>
          </button>
        </div>

        {/* Unit & Topic Tree */}
        <UnitTopicTree
          units={units}
          onOpenGenerateModal={handleOpenModal}
          onGenerateUnit={handleGenerateUnit}
        />
      </div>

      {/* AI Generation Modal */}
      <AIGenerationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onGenerate={handleGenerateAI}
        courseId={effectiveCourseId}
        unitId={selectedUnitId}
        topicId={selectedTopicId}
        defaultContentType={selectedContentType}
      />
    </div>
  );
};
