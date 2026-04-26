# Quick Start

Add a guided testing panel to your React app in five steps. When users complete tasks or report issues, the results appear as GitHub Issues in your repository — no external service required.

---

## What you'll end up with

A **Tasks** pull-tab on the right edge of your app. Users click through your tasks, answer questions, and hit **Next**. Each completed task is automatically submitted as a structured GitHub Issue.

---

## Before you start

You need:

- A React 18+ app
- A GitHub repository where issues will be collected
- An API endpoint deployed alongside your app ([copy a template](api-template.md))
- Four environment variables set in your hosting platform (see [Installation](installation.md#environment-variables))

---

## Step 1 — Install

```bash
npm install github:THD-Spatial-AI/feedback-kit
```

---

## Step 2 — Write your tasks

Create a file called `testing-tasks.ts` (anywhere in your `src/` folder). This is just a list — it tells the panel what to ask users and in what order.

```ts
// src/testing-tasks.ts
import type { TestingTask } from '@thd-spatial-ai/feedback-kit'

export const TESTING_TASKS: TestingTask[] = [
  {
    id:           'task-1',               // unique ID, also used as a GitHub label
    title:        'First impressions',    // shown at the top of the panel
    timeEstimate: '3–5 min',             // shown next to the title
    description:  'Take a minute to look at the screen — do not click anything yet.',
    feedbackGoalHint: 'I landed on the page for the first time and was trying to understand what to do.',

    steps: [
      {
        type:      'rating',
        text:      'How clear is it what you are supposed to do here?',
        lowLabel:  'No idea',
        highLabel: 'Immediately clear',
      },
      {
        type: 'todo',
        text: 'Find the main button and click it',
      },
      {
        type: 'yesno',
        text: 'Did the button do what you expected?',
      },
      {
        type: 'question',
        text: 'Anything confusing or surprising?',
      },
    ],
  },

  {
    id:           'task-2',
    title:        'Change a setting',
    timeEstimate: '2–3 min',
    description:  'Find the settings area and change any value.',
    feedbackGoalHint: 'I was trying to find the settings and change a value.',

    steps: [
      { type: 'todo',   text: 'Find where to change a setting' },
      { type: 'todo',   text: 'Change any value and save it' },
      { type: 'yesno',  text: 'Was it clear that the change was saved?' },
      { type: 'rating', text: 'How easy was the whole thing?', lowLabel: 'Very difficult', highLabel: 'Very easy' },
    ],
  },
]
```

**Step types:**

| `type` | What the user sees |
|---|---|
| `todo` | "Done ✓" and "No, I couldn't" buttons, with an optional comment field if they got stuck |
| `rating` | A 1–5 colour scale — you set the labels for each end |
| `yesno` | Yes / No buttons with an optional follow-up text field |
| `question` | A free-text box for open-ended answers |

---

## Step 3 — Add the components to your app

Wrap your app with `FeedbackKitProvider` (sets the API endpoint once for everything inside). Then add `<SessionPanel>` as a sibling to your app content — it renders as a fixed overlay and does not affect your layout.

```tsx
// src/App.tsx
import { useState } from 'react'
import { FeedbackKitProvider, SessionPanel } from '@thd-spatial-ai/feedback-kit'
import { TESTING_TASKS } from './testing-tasks'

export default function App() {
  // Track which task the user is on (starts at 0, the first task)
  const [taskIndex, setTaskIndex] = useState(0)

  // Track whether the panel is slid off-screen (starts visible)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <FeedbackKitProvider apiEndpoint="/api/feedback">

      {/* Your existing app — unchanged */}
      <YourApp />

      {/* The task panel — fixed overlay, rendered outside your layout */}
      <SessionPanel
        tasks={TESTING_TASKS}
        view="Home"                                               // label for the current screen
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

!!! tip "The `view` prop"
    Set `view` to the name of the screen the user is currently on. If your app has multiple screens, update it dynamically — e.g. `view={step === 'settings' ? 'Settings' : 'Home'}`. It gets attached to every GitHub Issue so you know exactly where feedback came from.

---

## Step 4 — Deploy the API endpoint

The panel POSTs results to `/api/feedback`. You need one server function to receive these and create GitHub Issues. Copy the template for your platform:

=== "Vercel"

    Copy `api-templates/vercel.ts` from the package into your project at `api/feedback.ts`.
    
    Then set these variables in your Vercel project dashboard:
    
    ```
    GITHUB_TOKEN          your Personal Access Token (Issues: write permission)
    GITHUB_OWNER          your GitHub username or org name
    GITHUB_REPO           your repository name
    BLOB_READ_WRITE_TOKEN auto-set when you link a Vercel Blob store
    ```

=== "Express / self-hosted"

    Copy `api-templates/express.ts` and mount it in your server:
    
    ```ts
    import feedbackRouter from './api-templates/express'
    app.use('/api', feedbackRouter)
    ```
    
    Set the same `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` variables, plus S3 credentials for image storage.  
    See [Self-Hosting](../architecture/self-hosting.md) for the full setup.

See [API Template](api-template.md) for the full endpoint contract.

---

## Step 5 — Verify

1. Start your dev server
2. The **Tasks** tab should appear on the right edge
3. Click through a task and submit it with the **Next** button
4. Check your GitHub repository — a `[Session]` issue should appear within seconds

---

## Optional: add the floating bug report button

Drop `<FeedbackWidget>` next to `<SessionPanel>` if you also want users to report issues on the fly:

```tsx
import { FeedbackKitProvider, SessionPanel, FeedbackWidget } from '@thd-spatial-ai/feedback-kit'

<FeedbackKitProvider apiEndpoint="/api/feedback">
  <YourApp />
  <SessionPanel ... />
  <FeedbackWidget view="Home" />
</FeedbackKitProvider>
```

This adds a floating **Report an issue** button at the bottom-right. Each submission creates a `[Feedback]` GitHub Issue, which a GitHub Actions workflow then refines into a structured developer ticket using GPT-4o.

---

## Reference implementation

The [Building Configurator](https://github.com/THD-Spatial-AI/building-configurator) is the full reference app. The key files to look at:

| File | What it shows |
|---|---|
| `src/app/App.tsx` | How `SessionPanel` is wired into a real app |
| `src/app/config/testingTasks.ts` | A complete set of tasks for a multi-step tool |
| `api/feedback.ts` | The deployed Vercel API endpoint |
