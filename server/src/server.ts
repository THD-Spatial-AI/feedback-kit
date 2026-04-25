import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenshotPayload {
  name:     string;
  data:     string;
  mimeType: string;
}

interface SubtaskResult {
  type:      string;
  step:      string;
  status?:   string;
  comment?:  string;
  response?: string;
  answer?:   string | null;
  rating?:   number | null;
}

interface FeedbackPayload {
  goal:               string;
  result:             string;
  rating:             number;
  view:               string;
  context:            string;
  url:                string;
  timestamp:          string;
  screenshots?:       ScreenshotPayload[];
  taskId?:            string | null;
  taskTitle?:         string | null;
  feedbackType?:      'issue' | 'session';
  subtaskResults?:    SubtaskResult[];
  additionalComment?: string;
}

// ─── Screenshot upload — skipped gracefully when MinIO is not configured ──────

const blobConfigured =
  !!process.env.S3_ENDPOINT &&
  !!process.env.S3_BUCKET   &&
  !!process.env.S3_ACCESS_KEY &&
  !!process.env.S3_SECRET_KEY;

const s3 = blobConfigured
  ? new S3Client({
      endpoint:    process.env.S3_ENDPOINT,
      region:      'us-east-1',
      credentials: {
        accessKeyId:     process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  : null;

async function uploadScreenshot(shot: ScreenshotPayload): Promise<string> {
  if (!s3) return '';
  const binary   = Buffer.from(shot.data, 'base64');
  const safeName = shot.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key      = `feedback-screenshots/${Date.now()}-${safeName}`;
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.S3_BUCKET!,
    Key:         key,
    Body:        binary,
    ContentType: shot.mimeType || 'image/png',
    ACL:         'public-read',
  }));
  return `${process.env.S3_PUBLIC_BASE}/${key}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ratingMeta(r: number): { label: string; ghLabel: string } {
  if (r <= 2)  return { label: `${r} – Easy`,       ghLabel: 'feedback: easy'     };
  if (r === 3) return { label: '3 – Moderate',       ghLabel: 'feedback: moderate' };
  if (r === 4) return { label: '4 – Difficult',      ghLabel: 'feedback: hard'     };
               return { label: '5 – Blocked/broken', ghLabel: 'feedback: blocked'  };
}

function buildIssueTitle(p: FeedbackPayload): string {
  const taskPart = p.taskTitle ? `[${p.taskTitle}] ` : '';
  const prefix   = `[Feedback] ${taskPart}`;
  const max      = 72 - prefix.length;
  const goal     = p.goal.replace(/\n/g, ' ').trim();
  return `${prefix}${goal.length > max ? goal.slice(0, max - 1) + '…' : goal}`;
}

function buildIssueBody(p: FeedbackPayload, screenshotUrls: string[]): string {
  const { label } = ratingMeta(p.rating);
  const lines = [
    '## User Feedback', '',
    '| Field | Value |', '|---|---|',
    ...(p.taskTitle ? [`| **Task** | ${p.taskTitle} |`] : []),
    `| **Screen** | ${p.view} |`,
    `| **Context** | ${p.context || '—'} |`,
    `| **Difficulty** | ${label} |`,
    `| **Submitted** | ${p.timestamp} |`,
    `| **URL** | ${p.url} |`,
    '', '---', '', '### What went wrong?', p.goal,
  ];
  if (screenshotUrls.length > 0) {
    lines.push('', `### Screenshots (${screenshotUrls.length})`);
    screenshotUrls.forEach((url, i) =>
      lines.push('', `**Screenshot ${i + 1}**`, `![Screenshot ${i + 1}](${url})`));
  } else if (!blobConfigured) {
    lines.push('', '*Screenshot upload is not configured on this server.*');
  }
  lines.push('', '---', '*Reported via the in-app feedback widget.*');
  return lines.join('\n');
}

function buildSessionTitle(p: FeedbackPayload): string {
  const goal = p.goal.replace(/\n/g, ' ').trim();
  return `[Session] ${goal.length > 65 ? goal.slice(0, 64) + '…' : goal}`;
}

function buildSessionBody(p: FeedbackPayload): string {
  const statusIcon = (s?: string) =>
    s === 'done' ? 'Done' : s === 'couldnt_finish' ? 'Could not finish' : '— Skipped';
  const ratingBar = (n?: number | null) =>
    !n ? '—' : '⬛'.repeat(n) + '⬜'.repeat(5 - n) + ` ${n}/5`;

  const lines = [
    '## Session Observation', '',
    '| Field | Value |', '|---|---|',
    `| **Task** | ${p.taskTitle || p.goal} |`,
    `| **Screen** | ${p.view} |`,
    `| **Submitted** | ${p.timestamp} |`,
    `| **URL** | ${p.url} |`,
  ];

  if (p.subtaskResults?.length) {
    const todos     = p.subtaskResults.filter(s => s.type === 'todo');
    const doneCount = todos.filter(s => s.status === 'done').length;
    lines.push('', '---', '', `### Steps (${doneCount} / ${todos.length} action steps completed)`);
    for (const r of p.subtaskResults) {
      lines.push('');
      if (r.type === 'todo') {
        lines.push(`**☑ ${r.step}**  ->  ${statusIcon(r.status)}`);
        if (r.comment) lines.push(`> ${r.comment}`);
      } else if (r.type === 'yesno') {
        lines.push(`**? ${r.step}**  ->  ${r.answer === 'yes' ? 'Yes' : r.answer === 'no' ? 'No' : '— Not answered'}`);
        if (r.comment) lines.push(`> ${r.comment}`);
      } else if (r.type === 'rating') {
        lines.push(`**★ ${r.step}**  ->  ${ratingBar(r.rating)}`);
      } else if (r.type === 'question') {
        lines.push(`**💬 ${r.step}**`);
        if (r.response) lines.push(`> ${r.response}`);
      }
    }
  }

  if (p.additionalComment?.trim())
    lines.push('', '---', '', '### Additional comments', '', `> ${p.additionalComment.trim()}`);

  lines.push('', '---', '*Auto-recorded from the in-app session panel.*');
  return lines.join('\n');
}

// ─── Route ────────────────────────────────────────────────────────────────────

app.post('/api/feedback', async (req, res) => {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    res.status(500).json({ error: 'Server misconfiguration: missing GitHub env vars' });
    return;
  }

  const payload = req.body as FeedbackPayload;
  if (!payload?.goal?.trim() || !payload?.result?.trim()) {
    res.status(400).json({ error: 'goal and result are required' });
    return;
  }

  const isSession = payload.feedbackType === 'session';

  const screenshotUrls: string[] = [];
  if (!isSession && blobConfigured) {
    for (const shot of payload.screenshots ?? []) {
      if (!shot?.data) continue;
      try { screenshotUrls.push(await uploadScreenshot(shot)); }
      catch (e) { console.error('Screenshot upload error:', e); }
    }
  }

  const title  = isSession ? buildSessionTitle(payload)  : buildIssueTitle(payload);
  const body   = isSession ? buildSessionBody(payload)   : buildIssueBody(payload, screenshotUrls);
  const labels = isSession
    ? ['session-data', ...(payload.taskId ? [payload.taskId] : [])]
    : ['user-feedback', 'ux', ratingMeta(payload.rating ?? 3).ghLabel, ...(payload.taskId ? [payload.taskId] : [])];

  const ghRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization:          `Bearer ${GITHUB_TOKEN}`,
        Accept:                 'application/vnd.github+json',
        'Content-Type':         'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, body, labels }),
    },
  );

  if (!ghRes.ok) {
    const err = await ghRes.text();
    console.error('GitHub API error:', err);
    res.status(502).json({ error: 'Failed to create GitHub issue' });
    return;
  }

  const issue = await ghRes.json() as { number: number; html_url: string };
  console.log(`Issue created: #${issue.number} — ${issue.html_url}`);
  res.status(201).json({ issueNumber: issue.number, issueUrl: issue.html_url });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    blob:   blobConfigured ? 'configured' : 'not configured — screenshots disabled',
  });
});

app.listen(PORT, () => {
  console.log(`Feedback API running on port ${PORT}`);
  console.log(`Blob storage: ${blobConfigured ? 'enabled (MinIO)' : 'disabled — text-only mode'}`);
});
