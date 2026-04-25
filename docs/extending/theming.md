# Theming

Components use Tailwind utility classes and CSS custom properties. You can change colours and positioning without touching component code.

---

## Via the provider

Pass a `theme` object to `FeedbackKitProvider`:

```tsx
<FeedbackKitProvider
  theme={{
    primaryColor: '#1a73e8',      // button and active state colour
    position:     'bottom-left',  // widget button position
    buttonLabel:  'Give feedback', // floating button text
  }}
>
```

| Option | Type | Default | Description |
|---|---|---|---|
| `primaryColor` | `string` | `--color-primary` CSS var | Hex or CSS colour for buttons and accents |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Floating button position |
| `buttonLabel` | `string` | `'Feedback'` | Floating button label |

---

## Via CSS variables

If your app already defines `--color-primary`, the components will use it automatically. Override it in your CSS:

```css
:root {
  --color-primary: #1a73e8;
}
```

---

## Custom className

Both components accept a `className` prop for the outermost wrapper if you need layout adjustments:

```tsx
<FeedbackWidget className="z-[200]" view="MyView" />
```

---

## Full design override

For deeper customisation — fonts, border radius, panel width — the components are built with standard Tailwind classes. Fork the component source from `src/components/` and adjust classes directly. The renderer registry pattern means you can also replace individual step type renderers with fully custom-styled versions without touching the panel logic. See [Custom Step Types](custom-step-types.md).
