# Installation

## Requirements

- React 18+
- Tailwind CSS v4 (for component styles — see note below)
- A GitHub repository where issues will be created
- An API endpoint to receive submissions ([API Template](api-template.md))

---

## Install the package

Install directly from GitHub — no npm registry account needed:

```bash
npm install github:THD-Spatial-AI/feedback-kit
```

To pin to a specific version (recommended so updates don't break your app unexpectedly):

```bash
# pin to a release tag
npm install github:THD-Spatial-AI/feedback-kit#v0.1.0

# pin to an exact commit
npm install github:THD-Spatial-AI/feedback-kit#abc1234
```

Your `package.json` entry will look like:

```json
"@thd-spatial-ai/feedback-kit": "github:THD-Spatial-AI/feedback-kit"
```

**To update to a newer version**, run the same install command again with the new tag, or just `npm install github:THD-Spatial-AI/feedback-kit` to get the latest commit on the default branch.

---

## Tailwind CSS

The components use Tailwind CSS classes for styling. Your app's Tailwind scanner needs to see these classes, otherwise the panel will appear unstyled.

Add a `@source` line to your Tailwind CSS entry file pointing at the installed package's compiled output:

```css
/* src/styles/tailwind.css (or wherever you import tailwindcss) */
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@source '../../node_modules/@thd-spatial-ai/feedback-kit/dist/*.{js,cjs}';
```

If you are using the default Tailwind v4 auto-detection (no `source(none)`), no change is needed — Tailwind will not scan `node_modules` by default, but all layout-critical styles in feedback-kit are set via inline styles and will work regardless.

---

## Environment variables

Set these in your hosting platform (Vercel dashboard, `.env` file, Dokploy env, etc.):

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Personal Access Token with **Issues: read/write** |
| `GITHUB_OWNER` | GitHub org or username (e.g. `THD-Spatial-AI`) |
| `GITHUB_REPO` | Repository name (e.g. `building-configurator`) |
| `BLOB_READ_WRITE_TOKEN` | Image storage — Vercel Blob token, or see [Self-Hosting](../architecture/self-hosting.md) |

!!! note "Vercel Blob"
    On Vercel, `BLOB_READ_WRITE_TOKEN` is created automatically when you link a Blob store to your project in the dashboard.

---

## GitHub labels

Create these labels in your target repository. The API applies them automatically to each issue.

| Label | Applied to |
|---|---|
| `session-data` | Session Panel submissions |
| `user-feedback` | Feedback Widget submissions |
| `ux` | Feedback Widget submissions |
| `feedback: easy` | Difficulty rating 1–2 |
| `feedback: moderate` | Difficulty rating 3 |
| `feedback: hard` | Difficulty rating 4 |
| `feedback: blocked` | Difficulty rating 5 |

---

## GitHub Actions workflows

Copy these two files from [`api-templates/`](https://github.com/THD-Spatial-AI/feedback-kit/tree/main/api-templates) into your repository's `.github/workflows/` directory:

| File | What it does |
|---|---|
| `add-to-org-project.yml` | Adds `[Session]` issues to your project board |
| `refine-feedback.yml` | Sends `[Feedback]` issues to GPT-4o and creates a refined `[Issue]` ticket |

---

## Local development

When you are iterating on the feedback-kit source itself (not just using it), pointing Vite directly at the local source gives you instant hot-reload with no build step.

**1. Add a Vite alias** in `vite.config.ts`:

```ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Resolve the package to local source instead of node_modules
      '@thd-spatial-ai/feedback-kit': path.resolve(__dirname, '../feedback-kit/src/index.ts'),
    },
  },
})
```

**2. Update the Tailwind source** to scan the local source files directly:

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
@source '../../../feedback-kit/src/**/*.{js,ts,jsx,tsx}';
```

With this in place, any change to `feedback-kit/src/` is reflected immediately in the consuming app — no `npm run build` needed.
