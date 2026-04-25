# feedback-kit

Drop-in React components for collecting structured user feedback as GitHub Issues — task-based testing sessions and ad-hoc bug reports. No external SaaS. No third-party data pipeline. Your GitHub repo is the backend.

---

## Components

| Component | What it is |
|---|---|
| `<SessionPanel>` | Slide-out panel — guided task walkthrough with typed steps (todo, rating, yes/no, question) |
| `<FeedbackWidget>` | Floating button — 4-step bug report form with screenshot capture and crop |

Each submission creates a GitHub Issue. A GitHub Actions workflow refines bug reports using GPT-4o into structured developer tickets.

---

## Install

```bash
npm install @thd-spatial-ai/feedback-kit
```

---

## Quick start

**1. Deploy the API endpoint** — copy [`api-templates/vercel.ts`](api-templates/vercel.ts) into your project's `api/` directory and set four environment variables:

```
GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, BLOB_READ_WRITE_TOKEN
```

**2. Define your tasks** — create a `tasks.config.ts` in your app:

```ts
import type { TestingTask } from '@thd-spatial-ai/feedback-kit'

export const myTasks: TestingTask[] = [
  {
    id: 'task-1',
    title: 'Find the settings panel',
    timeEstimate: '3–5 min',
    description: 'Start from the home screen and try to locate settings.',
    feedbackGoalHint: 'I was trying to find the settings panel.',
    steps: [
      { type: 'todo',   text: 'Locate the settings panel' },
      { type: 'rating', text: 'How easy was it?', lowLabel: 'Very hard', highLabel: 'Obvious' },
    ],
  },
]
```

**3. Wrap your app and add components:**

```tsx
import { FeedbackKitProvider, SessionPanel, FeedbackWidget } from '@thd-spatial-ai/feedback-kit'
import { myTasks } from './tasks.config'
import { useState } from 'react'

export function App() {
  const [taskIndex, setTaskIndex] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <FeedbackKitProvider apiEndpoint="/api/feedback">
      <YourContent />

      <SessionPanel
        tasks={myTasks}
        view="MyComponent"
        taskIndex={taskIndex}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(c => !c)}
        onNextTask={() => setTaskIndex(i => i + 1)}
        onPrevTask={() => setTaskIndex(i => i - 1)}
      />

      <FeedbackWidget view="MyComponent" />
    </FeedbackKitProvider>
  )
}
```

---

## Extending

Add new step types without modifying the package:

```tsx
import { defaultStepRenderers } from '@thd-spatial-ai/feedback-kit'

<FeedbackKitProvider
  stepRenderers={{ ...defaultStepRenderers, slider: MySliderStep }}
>
```

Intercept or enrich submissions:

```tsx
<FeedbackKitProvider
  onBeforeSubmit={(payload) => ({ ...payload, context: `v${APP_VERSION}` })}
  onSubmitSuccess={({ issueNumber }) => analytics.track('feedback', { issueNumber })}
>
```

---

## Self-hosting

The pipeline runs on any host. For Dokploy + MinIO setup, see [Self-Hosting](docs/architecture/self-hosting.md). The GitHub Issues + Actions layer is independent of where the app is hosted.

---

## Documentation

Full documentation: [thd-spatial-ai.github.io/feedback-kit](https://thd-spatial-ai.github.io/feedback-kit)

- [Getting Started](docs/getting-started/installation.md)
- [Session Panel](docs/components/session-panel.md)
- [Feedback Widget](docs/components/feedback-widget.md)
- [Custom Step Types](docs/extending/custom-step-types.md)
- [Architecture](docs/architecture/overview.md)
- [API Reference](docs/api-reference.md)

---

## Reference implementation

The [Building Configurator](https://github.com/THD-Spatial-AI/building-configurator) (EnerPlanET) is the reference consumer app — it demonstrates the full setup including task config, Vercel deployment, and GitHub Actions workflows.
