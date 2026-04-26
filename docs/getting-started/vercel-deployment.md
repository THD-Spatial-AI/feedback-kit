# Vercel Deployment

This guide covers everything you need to go from a working local dev setup to a live deployment on Vercel with the full feedback pipeline active.

---

## How it works on Vercel

Vercel automatically detects the `api/` folder in your project and turns each file inside it into a serverless function. The `api/feedback.ts` file you copied from the package becomes the endpoint at `https://your-app.vercel.app/api/feedback` — no manual routing or server config needed.

Screenshots are stored in **Vercel Blob** (Vercel's built-in object storage). Feedback results are written to **GitHub Issues** via the API.

```
Browser  →  POST /api/feedback  →  Vercel Function
                                        ↓              ↓
                                   Vercel Blob    GitHub Issues API
                                  (screenshots)   (creates the issue)
```

---

## Prerequisites

- Your React app is in a GitHub repository
- You have a [Vercel account](https://vercel.com) connected to that repository
- You have a separate GitHub repository where issues will be collected (can be the same repo)
- `api/feedback.ts` is in your project (copied from `feedback-kit/api-templates/vercel.ts`)

---

## Step 1 — Import your project to Vercel

If you haven't already:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your GitHub repository
3. Leave the build settings as-is (Vercel detects Vite automatically)
4. Click **Deploy** — it will fail or show no feedback functionality until you complete the steps below, but the initial deploy is fine

---

## Step 2 — Add a Blob store

The API function uploads screenshots to Vercel Blob. You need to create a store and link it to your project.

1. In the Vercel dashboard, open your project
2. Go to **Storage** tab → **Create Database**
3. Select **Blob** → click **Continue**
4. Give it a name (e.g. `feedback-screenshots`) → **Create**
5. On the next screen, select your project under **Connect to project** → **Connect**

Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your project's environment variables. You do not need to copy or set this one manually.

---

## Step 3 — Create a GitHub token

The API function creates issues in a GitHub repository. It needs a token with permission to do that.

1. Go to **GitHub → Settings → Developer settings → Fine-grained personal access tokens → Generate new token**
2. Set **Resource owner** to the org or user that owns the target repo
3. Under **Repository access**, select **Only select repositories** → choose the target repo
4. Under **Repository permissions**, set **Issues** to **Read and write**
5. Click **Generate token** and copy the value — you will not be able to see it again

---

## Step 4 — Set environment variables

In the Vercel dashboard → your project → **Settings** → **Environment Variables**, add these three:

| Name | Value |
| --- | --- |
| `GITHUB_TOKEN` | The token you just generated |
| `GITHUB_OWNER` | GitHub username or org that owns the target repo (e.g. `THD-Spatial-AI`) |
| `GITHUB_REPO` | Repository name where issues will be created (e.g. `building-configurator`) |

`BLOB_READ_WRITE_TOKEN` is already set from Step 2 — do not add it again.

After adding the variables, click **Save**. Then go to **Deployments** → open the latest deployment → **Redeploy** so the function picks up the new variables.

---

## Step 5 — Create GitHub labels

The API applies labels to each issue it creates. The labels must exist in the target repository before the first submission, otherwise the GitHub API silently drops them.

Go to your target repository → **Issues** → **Labels** → **New label**, and create all of these:

| Label name | Suggested colour |
| --- | --- |
| `session-data` | `#0075ca` (blue) |
| `user-feedback` | `#e4e669` (yellow) |
| `ux` | `#d93f0b` (orange) |
| `feedback: easy` | `#0e8a16` (green) |
| `feedback: moderate` | `#fbca04` (yellow) |
| `feedback: hard` | `#e99695` (light red) |
| `feedback: blocked` | `#b60205` (red) |

The label names must match exactly — spelling, spacing, and the colon.

---

## Step 6 — Add GitHub Actions workflows

Two workflow files automate what happens after an issue is created:

| Workflow | What it does |
| --- | --- |
| `add-to-org-project.yml` | Adds `[Session]` issues to your GitHub project board automatically |
| `refine-feedback.yml` | Sends `[Feedback]` issues to GPT-4o (via GitHub Models) and creates a refined `[Issue]` developer ticket |

Copy both files from `feedback-kit/api-templates/` into your **target repository** at `.github/workflows/`. Commit and push.

!!! note "GitHub Models access"
    `refine-feedback.yml` uses GitHub Models (GPT-4o). This requires your repository to have GitHub Models access enabled, which is available on GitHub Free and above. No additional API key is needed — the workflow uses the built-in `GITHUB_TOKEN`.

---

## Step 7 — Verify the deployment

1. Open your deployed app
2. Click through a task in the **Tasks** panel and hit **Next**
3. Go to your target GitHub repository → **Issues**
4. A `[Session]` issue should appear within a few seconds with the full step-by-step results

To test the bug report button:

1. Click **Report an issue** in the panel (or the floating button if you added `<FeedbackWidget>`)
2. Fill in the form and submit
3. A `[Feedback]` issue should appear, followed a minute later by a refined `[Issue]` ticket created by the Actions workflow

---

## Troubleshooting

**No issue appears after submitting**

Check the function logs: Vercel dashboard → your project → **Logs** → filter by `/api/feedback`. Common causes:

- `GITHUB_TOKEN` is missing or expired
- `GITHUB_OWNER` / `GITHUB_REPO` point to the wrong repository
- The token does not have Issues: write permission on that repository

**Issue appears but has no labels**

The labels in Step 5 were not created, or the names don't match exactly. Create them and re-submit.

**Screenshots missing from issue body**

The Blob store is not connected. Re-check Step 2 and redeploy after connecting it.

**`[Issue]` refinement never appears**

The `refine-feedback.yml` workflow may not be in the correct repository or may have a syntax error. Check the **Actions** tab of the target repo for workflow run errors.
