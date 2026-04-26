import * as react_jsx_runtime from 'react/jsx-runtime';
import React$1 from 'react';

type StepType = 'todo' | 'question' | 'yesno' | 'rating';
interface TaskStep {
    type: StepType;
    text: string;
    lowLabel?: string;
    highLabel?: string;
}
interface TestingTask {
    id: string;
    title: string;
    timeEstimate: string;
    description: string;
    steps: TaskStep[];
    feedbackGoalHint: string;
}
interface StepState {
    status: 'pending' | 'done' | 'couldnt_finish';
    comment: string;
    response: string;
    answer: 'yes' | 'no' | null;
    rating: number | null;
}
interface StepRendererProps {
    step: TaskStep;
    state: StepState;
    index: number;
    onChange: (patch: Partial<StepState>) => void;
}
type StepRendererMap = Record<string, React.ComponentType<StepRendererProps>>;
interface WidgetConfig {
    position?: 'bottom-right' | 'bottom-left';
    buttonLabel?: string;
    primaryColor?: string;
}
interface TaskTrigger {
    taskId: string;
    taskTitle: string;
    prefillGoal: string;
}
interface ScreenshotPayload {
    name: string;
    data: string;
    mimeType: string;
}
interface SubtaskResult {
    type: StepType;
    step: string;
    status?: 'done' | 'couldnt_finish' | 'pending';
    comment?: string;
    response?: string;
    answer?: 'yes' | 'no' | null;
    rating?: number | null;
}
interface FeedbackPayload {
    feedbackType: 'issue' | 'session';
    goal: string;
    result: string;
    rating: number;
    view: string;
    context: string;
    url: string;
    timestamp: string;
    screenshots?: ScreenshotPayload[];
    taskId?: string | null;
    taskTitle?: string | null;
    subtaskResults?: SubtaskResult[];
    additionalComment?: string;
}
interface SubmitResult {
    issueNumber: number;
    issueUrl: string;
}

interface ResolvedTheme {
    position: 'bottom-right' | 'bottom-left';
    buttonLabel: string;
    primaryColor?: string;
}
interface FeedbackKitContextValue {
    apiEndpoint: string;
    theme: ResolvedTheme;
    stepRenderers: StepRendererMap;
    onBeforeSubmit?: (payload: FeedbackPayload) => FeedbackPayload | Promise<FeedbackPayload>;
    onSubmitSuccess?: (result: SubmitResult) => void;
    onSubmitError?: (error: Error) => void;
}
interface FeedbackKitProviderProps {
    apiEndpoint: string;
    theme?: WidgetConfig;
    stepRenderers?: StepRendererMap;
    onBeforeSubmit?: FeedbackKitContextValue['onBeforeSubmit'];
    onSubmitSuccess?: FeedbackKitContextValue['onSubmitSuccess'];
    onSubmitError?: FeedbackKitContextValue['onSubmitError'];
    children: React$1.ReactNode;
}
declare function FeedbackKitProvider({ apiEndpoint, theme, stepRenderers, onBeforeSubmit, onSubmitSuccess, onSubmitError, children, }: FeedbackKitProviderProps): react_jsx_runtime.JSX.Element;

interface SessionPanelProps {
    tasks: TestingTask[];
    view: string;
    taskIndex: number;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    onNextTask: () => void;
    onPrevTask: () => void;
    apiEndpoint?: string;
    stepRenderers?: StepRendererMap;
    showReportButton?: boolean;
}
declare function SessionPanel({ tasks, view, taskIndex, collapsed, onToggleCollapsed, onNextTask, onPrevTask, apiEndpoint: propEndpoint, stepRenderers: propRenderers, showReportButton: showReportButtonProp, }: SessionPanelProps): react_jsx_runtime.JSX.Element;

interface FeedbackWidgetProps {
    view: string;
    context?: string;
    taskTrigger?: TaskTrigger | null;
    onTaskTriggerConsumed?: () => void;
    onSubmitted?: () => void;
    apiEndpoint?: string;
}
declare function FeedbackWidget({ view, context, taskTrigger, onTaskTriggerConsumed, onSubmitted, apiEndpoint: propEndpoint, }: FeedbackWidgetProps): react_jsx_runtime.JSX.Element;

declare function TodoStep({ step, state, index, onChange }: StepRendererProps): react_jsx_runtime.JSX.Element;

declare function QuestionStep({ step, state, index, onChange }: StepRendererProps): react_jsx_runtime.JSX.Element;

declare function YesNoStep({ step, state, index, onChange }: StepRendererProps): react_jsx_runtime.JSX.Element;

declare function RatingStep({ step, state, index, onChange }: StepRendererProps): react_jsx_runtime.JSX.Element;

declare const defaultStepRenderers: StepRendererMap;

export { FeedbackKitProvider, type FeedbackPayload, FeedbackWidget, type FeedbackWidgetProps, QuestionStep, RatingStep, type ScreenshotPayload, SessionPanel, type SessionPanelProps, type StepRendererMap, type StepRendererProps, type StepState, type StepType, type SubmitResult, type SubtaskResult, type TaskStep, type TaskTrigger, type TestingTask, TodoStep, type WidgetConfig, YesNoStep, defaultStepRenderers };
