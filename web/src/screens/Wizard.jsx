import Stepper from '../components/Stepper.jsx';
import RoomTypeStep from './steps/RoomTypeStep.jsx';
import PhotosStep from './steps/PhotosStep.jsx';
import DetailsStep from './steps/DetailsStep.jsx';
import StyleStep from './steps/StyleStep.jsx';
import ConceptsStep from './steps/ConceptsStep.jsx';
import DesignStep from './steps/DesignStep.jsx';
import EditStep from './steps/EditStep.jsx';
import FinalStep from './steps/FinalStep.jsx';
import { STEPS } from '../lib/models/constants.js';
import { useApp } from '../state/AppContext.jsx';

/**
 * حاوية رحلة المشروع.
 * `currentStep` محفوظ في المشروع نفسه، ففتح مشروع قديم يعود
 * تلقائياً لآخر خطوة وصلها المستخدم (البندان ٦ و٢٦).
 */
export default function Wizard() {
  const { active: project, update, updateWith, closeProject } = useApp();
  if (!project) return null;

  const step = project.currentStep;
  const goTo = (next) => update({ currentStep: next });

  const next = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) goTo(STEPS[i + 1]);
  };

  const back = () => {
    const i = STEPS.indexOf(step);
    if (i <= 0) return closeProject();
    goTo(STEPS[i - 1]);
  };

  const shared = { project, update, updateWith };

  return (
    <>
      <Stepper step={step} onBack={back} />

      {step === 'room_type' && <RoomTypeStep {...shared} onNext={next} />}
      {step === 'photos' && <PhotosStep {...shared} onNext={next} />}
      {step === 'details' && <DetailsStep {...shared} onNext={next} />}
      {step === 'style' && <StyleStep {...shared} onNext={next} />}
      {step === 'concepts' && <ConceptsStep {...shared} onNext={next} />}
      {step === 'design' && (
        <DesignStep {...shared} onEdit={() => goTo('edit')} onApprove={() => goTo('final')} />
      )}
      {step === 'edit' && <EditStep {...shared} onDone={() => goTo('final')} />}
      {step === 'final' && (
        <FinalStep {...shared} onBackToEdit={() => goTo('edit')} onClose={closeProject} />
      )}
    </>
  );
}
