import type { StepRendererMap } from '../types';
import { TodoStep }     from './TodoStep';
import { QuestionStep } from './QuestionStep';
import { YesNoStep }    from './YesNoStep';
import { RatingStep }   from './RatingStep';

export { TodoStep, QuestionStep, YesNoStep, RatingStep };

export const defaultStepRenderers: StepRendererMap = {
  todo:     TodoStep,
  question: QuestionStep,
  yesno:    YesNoStep,
  rating:   RatingStep,
};
