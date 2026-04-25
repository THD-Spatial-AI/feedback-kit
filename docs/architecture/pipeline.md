# Feedback Pipeline

End-to-end flow from an in-app interaction to a structured card on the project board.

---

## Two entry points, two issue types

```mermaid
flowchart TD
    U(["User"])

    U --> SP["Session Panel\ntask-based"]
    U --> FW["Feedback Widget\nquick report"]

    SP -->|feedbackType: session| API["POST /api/feedback"]
    FW -->|feedbackType: issue| API

    subgraph Host ["Your hosting (Vercel / Dokploy)"]
        API --> BLOB["Image storage\nVercel Blob / MinIO"]
        BLOB --> GH["GitHub Issues API"]
    end

    GH --> SI["[Session] issue"]
    GH --> FI["[Feedback] issue"]

    subgraph Actions ["GitHub Actions"]
        SI --> AP["add-to-org-project.yml\n→ project board"]
        FI --> RF["refine-feedback.yml\n→ GPT-4o rewrite\n→ [Issue] on board\n→ close original"]
    end
```

---

## Session Panel flow

```mermaid
flowchart LR
    T["tasks.config.ts"] --> SP["SessionPanel renders steps"]

    SP --> T1["todo\nDone / Couldn't finish"]
    SP --> T2["rating\n1–5 scale"]
    SP --> T3["yesno\nYes / No"]
    SP --> T4["question\nOpen text"]

    T1 & T2 & T3 & T4 --> SUB["User clicks Next / Finish"]
    SUB --> R["Rating derived\nautomatically"]
    R --> API["POST /api/feedback\nfeedbackType: session"]
    API --> GH["[Session] issue created"]
    GH --> BOARD["Added to project board"]
```

Session data is preserved raw — no AI processing — so researcher analysis can work from the original user responses.

---

## Feedback Widget flow

```mermaid
flowchart LR
    FW["FeedbackWidget\n4-step form"] --> API["POST /api/feedback\nfeedbackType: issue"]

    API --> BLOB["Screenshots uploaded\nto blob storage"]
    BLOB --> GH["[Feedback] issue created"]

    GH --> RF["refine-feedback.yml triggered"]
    RF --> AI["GPT-4o\nUX engineer prompt"]

    AI --> NI["[Issue] created with:\n· type: bug/enhancement/ux\n· priority label\n· structured body\n· original screenshots\n· raw feedback in details block"]

    NI --> BOARD["Added to project board"]
    NI --> CLOSE["Original [Feedback] closed"]
```

---

## AI refinement detail

The raw `[Feedback]` issue body is sent to GPT-4o (via GitHub Models) with a senior UX engineer system prompt. The model returns structured JSON:

```
title     → refined issue title
type      → bug | enhancement | ux
priority  → low | medium | high | critical
body      → Markdown with:
              Summary
              User Goal
              Observed Behaviour
              Expected Behaviour
              Steps to Reproduce
              Affected Component
              Suggested Fix
              Priority Rationale
```

The refined `[Issue]` keeps the original screenshots and folds the raw feedback into a collapsible `<details>` block for traceability.

The workflow skips bot-created issues to avoid trigger loops when it creates the refined `[Issue]`.

---

## Issue label reference

| Label | Applied by | Meaning |
|---|---|---|
| `session-data` | API | Issue contains raw session data |
| `user-feedback` | API | Issue is a raw feedback report |
| `ux` | API | Feedback Widget submission |
| `feedback: easy` | API | Difficulty rating 1–2 |
| `feedback: moderate` | API | Difficulty rating 3 |
| `feedback: hard` | API | Difficulty rating 4 |
| `feedback: blocked` | API | Difficulty rating 5 |
| `bug` / `enhancement` / `ux` | Actions (refined) | Issue type from GPT-4o |
| `priority: low/medium/high/critical` | Actions (refined) | Priority from GPT-4o |

---

## GitHub Actions workflows

| Workflow | Trigger | Input | Output |
|---|---|---|---|
| `add-to-org-project.yml` | Any issue/PR opened (not `[Feedback]`) | `[Session]` issues, PRs | Project board card |
| `refine-feedback.yml` | `[Feedback]` issue opened (human only) | Raw feedback body | Refined `[Issue]` + project card |

### Required secrets

| Secret | Scope | Used by |
|---|---|---|
| `ADD_TO_PROJECT_PAT` | `project` (org level) | Both workflows |
| `GITHUB_TOKEN` | Automatic | Provided by Actions runtime |
