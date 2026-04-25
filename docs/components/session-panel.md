# SessionPanel

A slide-out panel fixed to the right edge of the viewport. Guides the user through a structured testing session — one task at a time, with typed steps (todo, rating, yes/no, open question). Each submitted task creates a `[Session]` GitHub issue with the full step-by-step results.

---

## Usage

```tsx
import { SessionPanel } from '@thd-spatial-ai/feedback-kit'
import { myTasks } from './tasks.config'
import { useState } from 'react'

function MyComponent() {
  const [taskIndex, setTaskIndex] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <MyContent />
      <SessionPanel
        tasks={myTasks}
        view="MyComponent"
        taskIndex={taskIndex}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(c => !c)}
        onNextTask={() => setTaskIndex(i => i + 1)}
        onPrevTask={() => setTaskIndex(i => i - 1)}
      />
    </>
  )
}
```

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `tasks` | `TestingTask[]` | Yes | Task definitions — see [Task Config](#task-config) |
| `view` | `string` | Yes | Current screen name, attached to every issue |
| `taskIndex` | `number` | Yes | Index of the active task |
| `collapsed` | `boolean` | Yes | Whether the panel is slid off screen |
| `onToggleCollapsed` | `() => void` | Yes | Called when the pull tab is clicked |
| `onNextTask` | `() => void` | Yes | Called when Next / Finish is clicked |
| `onPrevTask` | `() => void` | Yes | Called when the back arrow is clicked |
| `apiEndpoint` | `string` | No | Overrides provider value |
| `stepRenderers` | `StepRendererMap` | No | Overrides provider renderers |

---

## Task config

Each task is a `TestingTask` object defined in your app:

```ts
import type { TestingTask } from '@thd-spatial-ai/feedback-kit'

export const myTasks: TestingTask[] = [
  {
    id:           'task-1',              // unique, used as GitHub label
    title:        'Find the settings',   // shown in panel header
    timeEstimate: '3–5 min',            // shown next to title
    description:  'Start from the home screen…',  // shown below title
    feedbackGoalHint: 'I was trying to find…',    // prefills the report form if user clicks "Report an issue"
    steps: [
      { type: 'todo',     text: 'Locate the settings panel' },
      { type: 'rating',   text: 'How easy was it?', lowLabel: 'Very hard', highLabel: 'Obvious' },
      { type: 'yesno',    text: 'Was the label clear?' },
      { type: 'question', text: 'Anything confusing?' },
    ],
  },
]
```

### Step types

| Type | UI | Data captured |
|---|---|---|
| `todo` | Done / Couldn't finish buttons + optional comment | `status`, `comment` |
| `rating` | 1–5 colour scale with optional axis labels | `rating` |
| `yesno` | Yes / No buttons + optional follow-up field | `answer`, `comment` |
| `question` | Free-text textarea | `response` |

---

## Session rating

The overall session difficulty rating is derived automatically — users do not set it manually.

```
If explicit 'rating' steps exist → average of those values (inverted: 5 = easy → severity 1)
Otherwise                        → todo completion ratio → mapped to 1–5 severity scale
```

This becomes the difficulty label applied to the GitHub issue.

---

## GitHub issue output

Each submitted task creates a `[Session]` issue:

- **Title:** `[Session] <task title>`
- **Body:** task metadata + step-by-step results table
- **Labels:** `session-data`, task ID

The issue is added to the project board by `add-to-org-project.yml` — no AI refinement is applied to session data, preserving the raw user responses.
