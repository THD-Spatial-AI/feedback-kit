# FeedbackKitProvider

The provider sets shared configuration once at the top of the tree. All `SessionPanel` and `FeedbackWidget` components inside it read from context — you do not need to pass `apiEndpoint` or `theme` to every component individually.

---

## Usage

```tsx
import { FeedbackKitProvider } from '@thd-spatial-ai/feedback-kit'

<FeedbackKitProvider
  apiEndpoint="/api/feedback"
  theme={{ primaryColor: '#1a73e8', position: 'bottom-right' }}
>
  <App />
</FeedbackKitProvider>
```

---

## Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiEndpoint` | `string` | Yes | — | URL that receives `POST /api/feedback` |
| `theme` | `WidgetConfig` | No | see below | Global styling defaults |
| `stepRenderers` | `StepRendererMap` | No | built-in renderers | Override or extend step type renderers |
| `onBeforeSubmit` | `(payload) => payload` | No | — | Transform payload before every submission |
| `onSubmitSuccess` | `(issue) => void` | No | — | Called after successful issue creation |
| `onSubmitError` | `(error) => void` | No | — | Called when submission fails |

### WidgetConfig defaults

```ts
{
  position:     'bottom-right',
  buttonLabel:  'Feedback',
  primaryColor: undefined   // falls back to --color-primary CSS variable
}
```

---

## Overriding per-component

Any prop set directly on a component takes precedence over the provider value.

```tsx
<FeedbackKitProvider apiEndpoint="/api/feedback">
  <FeedbackWidget
    apiEndpoint="/api/feedback-staging"  {/* overrides provider for this instance */}
    view="StagingView"
  />
</FeedbackKitProvider>
```

---

## Without a provider

Both components also work without a provider if you pass `apiEndpoint` directly. The provider just removes the repetition.

```tsx
<SessionPanel
  tasks={myTasks}
  view="MyComponent"
  apiEndpoint="/api/feedback"
  taskIndex={0}
  collapsed={false}
  onToggleCollapsed={() => {}}
  onNextTask={() => {}}
  onPrevTask={() => {}}
/>
```
