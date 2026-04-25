export type StepType = 'todo' | 'question' | 'yesno' | 'rating';

export interface TaskStep {
  type:       StepType;
  text:       string;
  lowLabel?:  string;
  highLabel?: string;
}

export interface TestingTask {
  id:               string;
  title:            string;
  timeEstimate:     string;
  description:      string;
  steps:            TaskStep[];
  feedbackGoalHint: string;
}

export interface StepState {
  status:   'pending' | 'done' | 'couldnt_finish';
  comment:  string;
  response: string;
  answer:   'yes' | 'no' | null;
  rating:   number | null;
}

export interface StepRendererProps {
  step:     TaskStep;
  state:    StepState;
  index:    number;
  onChange: (patch: Partial<StepState>) => void;
}

export type StepRendererMap = Record<string, React.ComponentType<StepRendererProps>>;

export interface WidgetConfig {
  position?:     'bottom-right' | 'bottom-left';
  buttonLabel?:  string;
  primaryColor?: string;
}

export interface TaskTrigger {
  taskId:      string;
  taskTitle:   string;
  prefillGoal: string;
}

export interface ScreenshotPayload {
  name:     string;
  data:     string;
  mimeType: string;
}

export interface SubtaskResult {
  type:      StepType;
  step:      string;
  status?:   'done' | 'couldnt_finish' | 'pending';
  comment?:  string;
  response?: string;
  answer?:   'yes' | 'no' | null;
  rating?:   number | null;
}

export interface FeedbackPayload {
  feedbackType:       'issue' | 'session';
  goal:               string;
  result:             string;
  rating:             number;
  view:               string;
  context:            string;
  url:                string;
  timestamp:          string;
  screenshots?:       ScreenshotPayload[];
  taskId?:            string | null;
  taskTitle?:         string | null;
  subtaskResults?:    SubtaskResult[];
  additionalComment?: string;
}

export interface SubmitResult {
  issueNumber: number;
  issueUrl:    string;
}
