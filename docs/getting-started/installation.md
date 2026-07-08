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

Copy the files from [`workflow-templates/`](https://github.com/THD-Spatial-AI/feedback-kit/tree/main/workflow-templates) into your repository. There are three workflows and one Node.js script.

### Step 1 — Copy the workflow files

Copy these into `.github/workflows/` in your repo:

| File | Trigger | What it does |
|---|---|---|
| `refine-feedback.yml` | Auto — `[Feedback]` issue opened | Sends raw bug reports to GPT-4o and creates a structured `[Issue]` ticket |
| `add-to-org-project.yml` | Auto — any issue or PR opened | Adds items to your GitHub Projects v2 board |
| `generate-user-stories.yml` | Manual (`workflow_dispatch`) | Aggregates session feedback and generates user story issues per testing phase |

### Step 2 — Copy the analysis script

Copy `workflow-templates/scripts/generate-user-stories.mjs` to `scripts/generate-user-stories.mjs` in your repo. This script is called by `generate-user-stories.yml`.

**Customise the `TASKS` map** inside the script to match your task config — it maps task labels (`task-1`, `task-2`, …) to titles and goal descriptions. The script uses these to give the LLM context when writing user stories.

```js
// scripts/generate-user-stories.mjs
const TASKS = {
  'task-1': { title: 'First impressions', goal: 'land on the app and find something to explore' },
  'task-2': { title: 'Core workflow',     goal: 'complete the main user journey'                },
  // add one entry per task in your tasks.config.ts
};
```

### Step 3 — Customise the workflows

Open each workflow file and update the marked `# CUSTOMISE` comments:

- **`refine-feedback.yml`** — replace the generic product description in the system prompt with your app name and a one-paragraph description of what it does. This gives the LLM context to write accurate bug reports.
- **`add-to-org-project.yml`** — replace `YOUR_ORG` and `YOUR_PROJECT_NUMBER` with your GitHub org and project board number.

### Step 4 — Add required secrets

| Secret | Required by | How to create |
|---|---|---|
| `ADD_TO_PROJECT_PAT` | `add-to-org-project.yml`, `refine-feedback.yml` | Fine-grained PAT with **Projects: read/write** for your org |

No other secrets are needed — `GITHUB_TOKEN` is auto-provided by Actions and covers both the GitHub REST API and GitHub Models API (the `models: read` permission is declared in each workflow).

### Running user story generation

Once sessions are collected, trigger `generate-user-stories.yml` from **Actions → Run workflow**:

- **`phase`** — a short identifier for this testing round, e.g. `phase-1-onboarding`. Used as a label on the generated issues. Re-using the same name regenerates stories for that phase.
- **`since` / `until`** — optional date window (`YYYY-MM-DD`) to restrict which sessions are included. Leave both blank to include all open session issues.

Each task with at least one session produces one user story issue tagged `user-story`, the phase label, and the task label. Session issues are tagged with the phase label for traceability.

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
