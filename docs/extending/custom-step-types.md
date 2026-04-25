# Custom Step Types

The four built-in step types (`todo`, `rating`, `yesno`, `question`) cover most testing scenarios. When you need something different — a slider, a multi-select, an image annotation — you can register a custom renderer without modifying the package.

---

## How renderers work

Each step type maps to a React component that receives the current step state and an `onChange` callback:

```ts
interface StepRendererProps {
  step:     TaskStep        // the step definition from your tasks config
  state:    StepState       // current response values
  onChange: (patch: Partial<StepState>) => void
}

type StepRenderer = React.ComponentType<StepRendererProps>
```

The `SessionPanel` looks up the renderer for each step's `type` field and renders it. If no renderer is found for a type, the step is skipped with a warning.

---

## Registering a custom renderer

Pass `stepRenderers` to the provider, spreading the defaults so built-in types still work:

```tsx
import {
  FeedbackKitProvider,
  defaultStepRenderers,
} from '@thd-spatial-ai/feedback-kit'
import { SliderStep } from './renderers/SliderStep'

<FeedbackKitProvider
  apiEndpoint="/api/feedback"
  stepRenderers={{
    ...defaultStepRenderers,
    slider: SliderStep,        // new type
  }}
>
  <App />
</FeedbackKitProvider>
```

Then use the new type in your tasks config:

```ts
{
  type: 'slider',
  text: 'How much effort did this take? (0 = none, 100 = extreme)',
}
```

---

## Writing a renderer

```tsx
// renderers/SliderStep.tsx
import type { StepRendererProps } from '@thd-spatial-ai/feedback-kit'

export function SliderStep({ step, state, onChange }: StepRendererProps) {
  const value = typeof state.rating === 'number' ? state.rating : 50

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] text-slate-200">{step.text}</p>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange({ rating: Number(e.target.value) })}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{step.lowLabel ?? '0'}</span>
        <span className="font-semibold text-slate-300">{value}</span>
        <span>{step.highLabel ?? '100'}</span>
      </div>
    </div>
  )
}
```

Renderers use the same `StepState` fields as built-in ones (`rating`, `response`, `answer`, `status`, `comment`). Map to whichever field makes sense for your type — the value will be serialised into the GitHub issue body.

---

## StepState reference

```ts
interface StepState {
  status:   'pending' | 'done' | 'couldnt_finish'  // for todo-style steps
  comment:  string                                  // optional follow-up text
  response: string                                  // for open-text steps
  answer:   'yes' | 'no' | null                    // for binary steps
  rating:   number | null                           // for numeric steps
}
```

Use whichever fields your renderer needs. Unused fields default to their initial values and are excluded from the issue body if empty.

---

## Overriding a built-in renderer

You can also replace a built-in renderer entirely — useful for restyling to match your app's design system:

```tsx
stepRenderers={{
  ...defaultStepRenderers,
  rating: MyBrandedRatingStep,   // replaces the built-in colour scale
}}
```
