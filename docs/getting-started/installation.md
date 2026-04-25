# Installation

## Requirements

- React 18+
- Tailwind CSS v4 (for component styles)
- A GitHub repo where issues will be created
- An API endpoint to receive feedback submissions (see [API Template](api-template.md))

## Install the package

```bash
npm install @thd-spatial-ai/feedback-kit
```

## Peer dependencies

The package requires React and Tailwind to be present in the consuming app — they are not bundled.

```bash
npm install react react-dom
```

Tailwind v4 is configured via your existing `vite.config.ts` — no additional setup needed if your app already uses it.

## Environment variables

The API endpoint needs three environment variables. These are set in your hosting platform (Vercel dashboard, Dokploy env, `.env` file for local dev).

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Personal Access Token with Issues: read/write |
| `GITHUB_OWNER` | GitHub org or user (e.g. `THD-Spatial-AI`) |
| `GITHUB_REPO` | Repository name (e.g. `building-configurator`) |
| `BLOB_READ_WRITE_TOKEN` | Image storage token (Vercel Blob or equivalent) |

!!! note "Vercel Blob"
    If using Vercel, `BLOB_READ_WRITE_TOKEN` is auto-provisioned when you link a Blob store to your project. For self-hosted setups, see [Self-Hosting](../architecture/self-hosting.md).

## GitHub Labels

Create these labels in your target repository — the API applies them automatically.

| Label | Used for |
|---|---|
| `session-data` | Session Panel submissions |
| `user-feedback` | Feedback Widget submissions |
| `ux` | Feedback Widget submissions |
| `feedback: easy` | Difficulty rating 1–2 |
| `feedback: moderate` | Difficulty rating 3 |
| `feedback: hard` | Difficulty rating 4 |
| `feedback: blocked` | Difficulty rating 5 |

## GitHub Actions

Two workflow files need to be present in the target repository's `.github/workflows/` directory:

- `add-to-org-project.yml` — adds Session issues to the project board
- `refine-feedback.yml` — runs GPT-4o refinement on Feedback issues

Copy these from the [`api-templates/`](https://github.com/THD-Spatial-AI/feedback-kit/tree/main/api-templates) directory.
