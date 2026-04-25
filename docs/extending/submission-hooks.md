# Submission Hooks

Hooks let you intercept, enrich, or react to feedback submissions without modifying the components or the API template.

---

## onBeforeSubmit

Transform the payload before it is sent. Return the modified payload — or throw to abort the submission.

```tsx
<FeedbackKitProvider
  apiEndpoint="/api/feedback"
  onBeforeSubmit={(payload) => ({
    ...payload,
    // attach app version to every submission
    context: `${payload.context} · v${APP_VERSION}`,
  })}
>
```

**Aborting a submission:**

```ts
onBeforeSubmit={(payload) => {
  if (!payload.goal.trim()) throw new Error('Empty submission blocked')
  return payload
}}
```

The component catches the error and shows it as a form validation message.

---

## onSubmitSuccess

Called after the API responds with a created issue. Use it for analytics, toast notifications, or redirects.

```tsx
<FeedbackKitProvider
  onSubmitSuccess={({ issueNumber, issueUrl }) => {
    analytics.track('feedback_submitted', { issueNumber })
    toast.success(`Issue #${issueNumber} created`)
  }}
>
```

---

## onSubmitError

Called when the API returns an error or the network request fails.

```tsx
<FeedbackKitProvider
  onSubmitError={(error) => {
    Sentry.captureException(error)
  }}
>
```

---

## Combining hooks

All three hooks can be set at the provider level (applies to every submission) or at the component level (applies to that component only). Component-level hooks take precedence.

```tsx
<FeedbackKitProvider onSubmitSuccess={globalHandler}>
  <FeedbackWidget
    view="Checkout"
    onSubmitSuccess={checkoutSpecificHandler}   {/* overrides global for this widget */}
  />
</FeedbackKitProvider>
```
