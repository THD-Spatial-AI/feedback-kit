# SessionPanel

A slide-out panel fixed to the right edge of the viewport. Guides users through a structured testing session — one task at a time, with typed steps. Each submitted task creates a `[Session]` GitHub Issue with the full step-by-step responses.

---

## Minimal example

```tsx
import { useState } from 'react'
import { FeedbackKitProvider, SessionPanel } from '@thd-spatial-ai/feedback-kit'
import { TESTING_TASKS } from './testing-tasks'

export default function App() {
  const [taskIndex, setTaskIndex] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <FeedbackKitProvider apiEndpoint="/api/feedback">
      <YourApp />

      <SessionPanel
        tasks={TESTING_TASKS}
        view="Home"
        taskIndex={taskIndex}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(c => !c)}
        onNextTask={() => setTaskIndex(i => i + 1)}
        onPrevTask={() => setTaskIndex(i => Math.max(0, i - 1))}
      />
    </FeedbackKitProvider>
  )
}
```

The panel is a fixed-position overlay — it sits on top of your app and does not shift or affect the layout of anything around it.

---

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `tasks` | `TestingTask[]` | Yes | The list of tasks, defined in your app |
| `view` | `string` | Yes | Name of the current screen — attached to every GitHub Issue |
| `taskIndex` | `number` | Yes | Index of the active task (0 = first) |
| `collapsed` | `boolean` | Yes | `true` = panel slid off-screen, only the pull tab is visible |
| `onToggleCollapsed` | `() => void` | Yes | Called when the user clicks the pull tab |
| `onNextTask` | `() => void` | Yes | Called when the user clicks Next or Finish |
| `onPrevTask` | `() => void` | Yes | Called when the user clicks the back arrow |
| `apiEndpoint` | `string` | No | Override the provider's endpoint for this panel only |
| `stepRenderers` | `StepRendererMap` | No | Override step renderers for this panel only |
| `showReportButton` | `boolean` | No | Hide the "Report an issue" button (default: `true`) |

---

## Task config

Each task is a plain TypeScript object. Create a `testing-tasks.ts` file in your app — the panel renders whatever you put here.

```ts
import type { TestingTask } from '@thd-spatial-ai/feedback-kit'

export const TESTING_TASKS: TestingTask[] = [
  {
    id:           'task-1',         // unique — also used as a GitHub label on the issue
    title:        'First impressions',
    timeEstimate: '3–5 min',
    description:  'Take a minute to look around — do not click anything yet.',
    feedbackGoalHint: 'I landed on the page and was trying to understand what to do.',

    steps: [
      // Rating: 1–5 scale, you set both end labels
      {
        type:      'rating',
        text:      'How clear is it what you are supposed to do?',
        lowLabel:  'No idea',
        highLabel: 'Immediately clear',
      },
      // Todo: action step — Done or Couldn't finish, optional comment
      {
        type: 'todo',
        text: 'Click the main button',
      },
      // Yes/No: binary question, optional follow-up text field
      {
        type: 'yesno',
        text: 'Did the button do what you expected?',
      },
      // Question: open-ended text answer
      {
        type: 'question',
        text: 'Anything confusing?',
      },
    ],
  },
]
```

### Step types

| `type` | UI element | Data captured |
| --- | --- | --- |
| `todo` | "Done ✓" / "No, I couldn't" buttons + optional comment | `status`, `comment` |
| `rating` | 1–5 colour scale with axis labels | `rating` (1–5) |
| `yesno` | Yes / No buttons + optional follow-up field | `answer`, `comment` |
| `question` | Free-text textarea | `response` |

### `feedbackGoalHint`

When a user clicks **Report an issue** from inside the panel, this string pre-fills the first field of the report form ("What were you trying to do?"). Write it in first person from the user's perspective.

---

## Changing `view` dynamically

If your app has multiple distinct screens, update `view` as the user navigates. This makes it easy to filter GitHub Issues by where the feedback was collected.

```tsx
// Example: configurator app with two modes
const currentView = showConfigurator ? 'Configurator' : 'Map'

<SessionPanel
  tasks={TESTING_TASKS}
  view={currentView}
  ...
/>
```

---

## How the difficulty rating is calculated

Users never set a difficulty number manually. The panel derives it automatically:

- If the task has `rating` steps → average of those ratings, inverted (5 = easy → severity 1)
- Otherwise → percentage of `todo` steps marked Done → mapped to a 1–5 severity scale

This becomes the difficulty label on the GitHub Issue (`feedback: easy` through `feedback: blocked`).

---

## GitHub Issue output

Each submitted task creates a `[Session]` issue:

- **Title:** `[Session] Task N — <task title>`
- **Body:** task metadata + step-by-step results table
- **Labels:** `session-data`, task `id`

Session issues are not processed by AI — the raw user responses are preserved exactly as entered.
