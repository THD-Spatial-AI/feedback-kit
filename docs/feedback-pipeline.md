# Feedback Pipeline

End-to-end system for collecting, storing, and triaging user feedback — from an in-app interaction to a structured card on the organisation project board, with no manual steps.

---

## How it works

The pipeline has three phases: **collection** (in-app components → GitHub Issues), **triage** (automatic AI refinement), and **synthesis** (manual user story generation per testing phase).

```mermaid
flowchart TD
    A(["User"])

    A --> B["Session Panel<br>(task-based)"]
    A --> C["Feedback Widget<br>(quick report)"]

    B --> D["POST /api/feedback<br>feedbackType: 'session'"]
    C --> E["POST /api/feedback<br>feedbackType: 'issue'"]

    subgraph API ["API layer (Vercel / Express)"]
        D --> F["Upload screenshots<br>Blob storage"]
        E --> F
        F --> G["GitHub Issues API"]
    end

    G --> H["[Session] issue<br>labels: session-data, task-N"]
    G --> I["[Feedback] issue<br>labels: user-feedback, ux"]

    subgraph Actions ["GitHub Actions — automatic"]
        H --> J["add-to-org-project.yml<br>→ Project board"]
        I --> K["refine-feedback.yml<br>→ GPT-4o rewrite<br>→ [Issue] on board<br>→ close original"]
    end

    subgraph Synthesis ["GitHub Actions — manual trigger"]
        H --> L["generate-user-stories.yml<br>Phase + date window<br>→ aggregate sessions by task<br>→ GPT-4o per task<br>→ [user-story] issues"]
    end
```

---

## Entry points

| | Session Panel | Feedback Widget |
|---|---|---|
| **Component** | `<SessionPanel>` | `<FeedbackWidget>` |
| **Trigger** | Sidebar tab (right edge) | Floating button (bottom-right) |
| **Mode** | Guided task walkthrough | Free-form 4-step form |
| **Issue type** | `[Session]` | `[Feedback]` |
| **AI refinement** | No — raw data preserved | Yes — rewritten by GPT-4o |
| **Project board** | `add-to-org-project.yml` | `refine-feedback.yml` |

---

## Entry point 1 — Session Panel (task-based)

Each testing session is structured around a named task. The user works through a series of steps, answers inline questions, and submits at the end. Every session produces one `[Session]` GitHub issue.

### Task flow

```mermaid
flowchart LR
    T["tasks.config.ts\n(in your app)"]
    T --> SP["SessionPanel renders steps"]

    SP --> ST1["todo\nDone / Couldn't finish"]
    SP --> ST2["rating\n1–5 scale"]
    SP --> ST3["yesno\nYes / No"]
    SP --> ST4["question\nOpen text"]

    ST1 & ST2 & ST3 & ST4 --> R["User submits session"]
    R --> SC["Rating derived\n(explicit rating steps\nor todo completion ratio)"]
    SC --> API["POST /api/feedback\nfeedbackType: 'session'"]
```

### Step types

| Type | UI | Captured data |
|---|---|---|
| `todo` | Done / Couldn't finish + optional reason | `status`, `comment` |
| `rating` | 1–5 colour scale with axis labels | `rating` |
| `yesno` | Yes / No + optional follow-up | `answer`, `comment` |
| `question` | Free-text area | `response` |

### Session rating derivation

The overall session rating is derived automatically — users do not set it manually.

```
If explicit 'rating' steps exist → average of those values (inverted: 5 = easy → severity 1)
Otherwise                        → todo completion ratio → mapped to 1–5 severity scale
```

This becomes the difficulty label on the GitHub issue.

---

## Entry point 2 — Feedback Widget (quick report)

A lightweight 4-step form for ad-hoc issue reports, independent of any task session.

```mermaid
flowchart LR
    S1["Step 1\nWhat were you\ntrying to do?"] -->
    S2["Step 2\nWhat happened vs\nwhat you expected?"] -->
    S3["Step 3\nDifficulty rating"] -->
    S4["Step 4\nScreenshots\n(capture or upload)"] -->
    SUB["POST /api/feedback\nfeedbackType: 'issue'"]
```

The widget captures `view` (current screen), `context`, and `url` from the app automatically — no manual tagging needed.

---

## API layer

**File:** `api-templates/vercel.ts` (Vercel) or `api-templates/express.ts` (self-hosted)

```mermaid
sequenceDiagram
    participant App
    participant API as /api/feedback
    participant Blob as Image Storage
    participant GH as GitHub Issues

    App->>API: POST JSON payload
    loop each screenshot
        API->>Blob: Upload base64 → binary
        Blob-->>API: Public CDN URL
    end
    API->>GH: Create issue with embedded image URLs
    GH-->>API: Issue URL
    API-->>App: 201 { issueNumber, issueUrl }
```

### Issue formats

| Field | `[Session]` issue | `[Feedback]` issue |
|---|---|---|
| **Title** | `[Session] <task title>` | `[Feedback] <user goal>` |
| **Body** | Task metadata + step-by-step results table | Goal, result, difficulty, screenshots |
| **Labels** | `session-data`, task ID | `user-feedback`, `ux`, difficulty label |

### Difficulty labels

| Rating | Label |
|---|---|
| 1–2 | `feedback: easy` |
| 3 | `feedback: moderate` |
| 4 | `feedback: hard` |
| 5 | `feedback: blocked` |

### Environment variables

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | PAT with Issues: read/write |
| `GITHUB_OWNER` | e.g. `THD-Spatial-AI` |
| `GITHUB_REPO` | e.g. `building-configurator` |
| `BLOB_READ_WRITE_TOKEN` | Auto-provisioned when Vercel Blob store is linked |

For self-hosted (MinIO/S3), see the [Self-Hosting guide](architecture/self-hosting.md).

---

## GitHub Actions

```mermaid
flowchart TD
    NEW["New issue opened"]
    NEW --> CHECK{Has Feedback prefix?}

    CHECK -- Yes --> RF["refine-feedback.yml"]
    CHECK -- No  --> AP["add-to-org-project.yml"]

    RF --> AI["GPT-4o\nUX engineer prompt"]
    AI --> NI["Create refined Issue with:\n· type: bug / enhancement / ux\n· priority label\n· original screenshots\n· raw feedback in details block"]
    NI --> ADD["Add refined Issue to project board"]
    NI --> CLOSE["Close original Feedback issue"]

    AP --> BOARD["Add to project board"]
```

### Workflows

| Workflow | Trigger | Handles | Output |
|---|---|---|---|
| `refine-feedback.yml` | `[Feedback]` issue opened (human only) | Bug reports | Refined `[Issue]`, project card, closes raw |
| `add-to-org-project.yml` | Any issue/PR opened (except `[Feedback]`) | Sessions, PRs, regular issues | Project card |

### AI refinement

The raw feedback body is sent to GPT-4o (via GitHub Models) with a senior UX engineer system prompt. The model returns structured JSON:

```
title     → refined issue title
type      → bug | enhancement | ux
priority  → low | medium | high | critical
body      → Markdown with:
              Summary · User Goal · Observed Behaviour
              Expected Behaviour · Steps to Reproduce
              Affected Component · Suggested Fix · Priority Rationale
```

The refined issue preserves the original screenshots and folds the raw feedback into a collapsible `<details>` block for traceability.

!!! note "Bot loop prevention"
    `refine-feedback.yml` skips bot-created issues (actor check) to prevent trigger loops when the workflow itself creates the refined `[Issue]`.

### Required secrets

| Secret | Scope | Used by |
|---|---|---|
| `ADD_TO_PROJECT_PAT` | `project` (org level) | Both workflows |
| `GITHUB_TOKEN` | Automatic | Provided by Actions runtime |

---

## Phase 3 — User story generation

After collecting enough session feedback for a testing round, trigger `generate-user-stories.yml` from **Actions → Run workflow**. It reads all open `session-data` issues, groups them by task, and synthesises one user story issue per task.

### Phase inputs

| Input | Required | Description |
|---|---|---|
| `phase` | Yes | Short identifier, e.g. `phase-1-onboarding`. Becomes a label on all output issues. Re-using the same name regenerates stories for that phase (old ones are closed first). |
| `since` | No | ISO date — only include sessions created on or after this date |
| `until` | No | ISO date — only include sessions up to this date |

### Output per task

One GitHub issue with labels `user-story`, the phase label, and the task label:

```
## User Story
As a **[user type]**, I want to **[goal]**, so that **[benefit]**.

## Acceptance Criteria
- [ ] ...

## Evidence — phase-1
**Sessions:** #45, #46, #47 ...
**Action step completion:** 12 of 14 steps completed

| Question | Yes | No | Not answered |
...

## Priority
**Medium** — average rating 2.8/5; several users did not answer the comprehension question.
```

### Phase lifecycle

| Scenario | What happens |
|---|---|
| First run for a phase | User story issues created; session issues tagged with phase label |
| Same phase, more sessions — re-run | Old user story issues closed, new ones created with updated data |
| New testing round with different tasks | Trigger with a new phase name; new user stories created independently |

!!! info "Customise the TASKS map"
    The script (`scripts/generate-user-stories.mjs`) contains a `TASKS` map that provides the LLM with each task's title and goal. Update this map whenever your task config changes between phases.

---

## Payload reference

Both entry points POST to the same endpoint. The `feedbackType` field determines downstream behaviour.

| Field | Type | Required | Notes |
|---|---|---|---|
| `feedbackType` | `'issue' \| 'session'` | Yes | Routes issue format |
| `goal` | `string` | Yes | User's stated objective |
| `result` | `string` | Yes | What happened |
| `rating` | `1–5` | Yes | Difficulty / severity |
| `view` | `string` | Yes | Current screen name |
| `context` | `string` | Yes | Additional context string |
| `url` | `string` | Yes | Page URL at submission |
| `timestamp` | `string` | Yes | ISO 8601 |
| `screenshots` | `ScreenshotPayload[]` | No | base64 + mimeType |
| `taskId` | `string` | Session only | Links to task config |
| `taskTitle` | `string` | Session only | Human-readable title |
| `subtaskResults` | `SubtaskResult[]` | Session only | Per-step responses |
| `additionalComment` | `string` | No | Free-text observation |
