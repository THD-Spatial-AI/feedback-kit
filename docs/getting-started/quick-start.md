# Quick Start

This guide wires up both components in a new React app in five steps. Uses the Building Configurator as a reference example.

---

## Step 1 — Deploy the API endpoint

Copy [`api-templates/vercel.ts`](api-template.md) into your project's `api/` directory (or `express.ts` for self-hosted). This is the serverless function that receives submissions, uploads screenshots, and creates GitHub issues.

```
your-app/
└── api/
    └── feedback.ts   ← copy from feedback-kit/api-templates/vercel.ts
```

Set the required environment variables in your hosting platform.

---

## Step 2 — Define your tasks

Create a `tasks.config.ts` in your app. This file is specific to the component you are testing — it lives in your app, not in the package.

```ts
// tasks.config.ts
import type { TestingTask } from '@thd-spatial-ai/feedback-kit'

export const myTasks: TestingTask[] = [
  {
    id:           'task-1',
    title:        'Find the settings panel',
    timeEstimate: '3–5 min',
    description:  'Start from the home screen and try to find where settings are.',
    feedbackGoalHint: 'I was trying to find the settings panel from the home screen.',
    steps: [
      { type: 'todo',     text: 'Locate the settings panel' },
      { type: 'rating',   text: 'How easy was it to find?', lowLabel: 'Very hard', highLabel: 'Obvious' },
      { type: 'question', text: 'Anything confusing along the way?' },
    ],
  },
  {
    id:           'task-2',
    title:        'Change a setting and save',
    timeEstimate: '2–3 min',
    description:  'Pick any setting, change it, and make sure it saves.',
    feedbackGoalHint: 'I was trying to change a setting and save it.',
    steps: [
      { type: 'todo',  text: 'Change any setting' },
      { type: 'todo',  text: 'Save the change' },
      { type: 'yesno', text: 'Was it clear that the change was saved?' },
    ],
  },
]
```

---

## Step 3 — Wrap your app with the Provider

The provider sets the API endpoint once — all components in the tree pick it up from context.

```tsx
// main.tsx or App.tsx
import { FeedbackKitProvider } from '@thd-spatial-ai/feedback-kit'

root.render(
  <FeedbackKitProvider apiEndpoint="/api/feedback">
    <App />
  </FeedbackKitProvider>
)
```

---

## Step 4 — Add the components

Drop the components into whatever view you are testing. Both components are fixed-position overlays — they sit on top of your existing UI.

```tsx
// YourComponent.tsx
import { SessionPanel, FeedbackWidget } from '@thd-spatial-ai/feedback-kit'
import { myTasks } from './tasks.config'
import { useState } from 'react'

export function YourComponent() {
  const [taskIndex,  setTaskIndex]  = useState(0)
  const [collapsed,  setCollapsed]  = useState(false)

  return (
    <>
      {/* your existing UI */}
      <MyContent />

      <SessionPanel
        tasks={myTasks}
        view="SettingsPanel"
        taskIndex={taskIndex}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(c => !c)}
        onNextTask={() => setTaskIndex(i => i + 1)}
        onPrevTask={() => setTaskIndex(i => i - 1)}
      />

      <FeedbackWidget
        view="SettingsPanel"
      />
    </>
  )
}
```

---

## Step 5 — Verify

1. Open your app in the browser
2. The **Tasks** pull tab should appear on the right edge
3. The **Feedback** button should appear at the bottom-right
4. Submit a test session — check your GitHub repo for a new `[Session]` issue
5. Submit a test bug report — check for a `[Feedback]` issue, then a refined `[Issue]` after the Actions workflow runs

---

## Full example

The Building Configurator app is the reference implementation. Its source is in [`examples/building-configurator/`](https://github.com/THD-Spatial-AI/feedback-kit/tree/main/examples/building-configurator).
