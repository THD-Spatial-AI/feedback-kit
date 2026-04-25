# API Reference

---

## Components

### `<FeedbackKitProvider>`

```ts
interface FeedbackKitProviderProps {
  apiEndpoint:      string
  theme?:           WidgetConfig
  stepRenderers?:   StepRendererMap
  onBeforeSubmit?:  (payload: FeedbackPayload) => FeedbackPayload | Promise<FeedbackPayload>
  onSubmitSuccess?: (result: { issueNumber: number; issueUrl: string }) => void
  onSubmitError?:   (error: Error) => void
  children:         React.ReactNode
}
```

---

### `<SessionPanel>`

```ts
interface SessionPanelProps {
  tasks:             TestingTask[]
  view:              string
  taskIndex:         number
  collapsed:         boolean
  onToggleCollapsed: () => void
  onNextTask:        () => void
  onPrevTask:        () => void
  apiEndpoint?:      string           // overrides provider
  stepRenderers?:    StepRendererMap  // overrides provider
}
```

---

### `<FeedbackWidget>`

```ts
interface FeedbackWidgetProps {
  view:                   string
  context?:               string
  taskTrigger?:           TaskTrigger | null
  onTaskTriggerConsumed?: () => void
  onSubmitted?:           () => void
  apiEndpoint?:           string  // overrides provider
}
```

---

## Types

### TestingTask

```ts
interface TestingTask {
  id:               string       // unique ID — used as GitHub label
  title:            string
  timeEstimate:     string       // e.g. '3–5 min'
  description:      string
  feedbackGoalHint: string       // prefills report form when opened from this task
  steps:            TaskStep[]
}
```

### TaskStep

```ts
interface TaskStep {
  type:       StepType           // 'todo' | 'rating' | 'yesno' | 'question'
  text:       string
  lowLabel?:  string             // rating scale left label
  highLabel?: string             // rating scale right label
}
```

### StepState

```ts
interface StepState {
  status:   'pending' | 'done' | 'couldnt_finish'
  comment:  string
  response: string
  answer:   'yes' | 'no' | null
  rating:   number | null
}
```

### StepRendererProps

```ts
interface StepRendererProps {
  step:     TaskStep
  state:    StepState
  onChange: (patch: Partial<StepState>) => void
}
```

### StepRendererMap

```ts
type StepRendererMap = Record<string, React.ComponentType<StepRendererProps>>
```

### WidgetConfig

```ts
interface WidgetConfig {
  position?:     'bottom-right' | 'bottom-left'
  buttonLabel?:  string
  primaryColor?: string
}
```

### TaskTrigger

```ts
interface TaskTrigger {
  taskId:      string
  taskTitle:   string
  prefillGoal: string
}
```

### FeedbackPayload

```ts
interface FeedbackPayload {
  feedbackType:       'issue' | 'session'
  goal:               string
  result:             string
  rating:             number        // 1–5
  view:               string
  context:            string
  url:                string
  timestamp:          string        // ISO 8601
  screenshots?:       ScreenshotPayload[]
  taskId?:            string | null
  taskTitle?:         string | null
  subtaskResults?:    SubtaskResult[]
  additionalComment?: string
}
```

### ScreenshotPayload

```ts
interface ScreenshotPayload {
  name:     string
  data:     string    // base64, no data-URI prefix
  mimeType: string
}
```

---

## Exports

```ts
// Components
export { FeedbackKitProvider } from './context/FeedbackKitProvider'
export { SessionPanel }        from './components/SessionPanel'
export { FeedbackWidget }      from './components/FeedbackWidget'

// Renderers
export { defaultStepRenderers } from './renderers'
export { TodoStep }     from './renderers/TodoStep'
export { RatingStep }   from './renderers/RatingStep'
export { YesNoStep }    from './renderers/YesNoStep'
export { QuestionStep } from './renderers/QuestionStep'

// Types
export type {
  TestingTask, TaskStep, StepType, StepState,
  StepRendererProps, StepRendererMap,
  WidgetConfig, TaskTrigger,
  FeedbackPayload, ScreenshotPayload,
} from './types'
```
