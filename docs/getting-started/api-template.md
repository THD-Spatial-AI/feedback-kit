# API Template

The components POST JSON to an endpoint you control. The package ships ready-to-use templates for two runtimes — copy one into your project and configure the environment variables.

---

## Vercel (serverless function)

Copy `api-templates/vercel.ts` into your project at `api/feedback.ts`.

**What it does:**

1. Receives the JSON payload from the component
2. Uploads each screenshot (base64) to Vercel Blob, gets back a public CDN URL
3. Creates a GitHub Issue with the URLs embedded as Markdown images
4. Returns `{ issueNumber, issueUrl }` to the component

**Environment variables required:**

```
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
BLOB_READ_WRITE_TOKEN    ← auto-set when Blob store is linked in Vercel dashboard
```

---

## Express (self-hosted)

Copy `api-templates/express.ts` and mount it in your server:

```ts
import feedbackRouter from './api-templates/express'
app.use('/api', feedbackRouter)
```

For image storage, configure your S3-compatible store (MinIO, Cloudflare R2, AWS S3):

```
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
S3_ENDPOINT       ← e.g. http://minio:9000
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
S3_PUBLIC_BASE    ← public URL prefix, e.g. https://storage.myapp.com/feedback
```

See [Self-Hosting](../architecture/self-hosting.md) for the full Dokploy + MinIO setup.

---

## Custom endpoint

If you need a different runtime (Next.js route handler, Fastify, Python, etc.), the payload contract is fixed — implement it in any language:

### Request

```
POST /api/feedback
Content-Type: application/json
```

```ts
{
  feedbackType:      'issue' | 'session'
  goal:              string
  result:            string
  rating:            1 | 2 | 3 | 4 | 5
  view:              string
  context:           string
  url:               string
  timestamp:         string          // ISO 8601
  screenshots?:      ScreenshotPayload[]
  taskId?:           string | null
  taskTitle?:        string | null
  subtaskResults?:   SubtaskResult[] // session only
  additionalComment?: string
}
```

### Screenshot payload

```ts
{
  name:     string   // filename
  data:     string   // base64, no data-URI prefix
  mimeType: string   // 'image/png' | 'image/jpeg' | 'image/webp'
}
```

### Response

```ts
{ issueNumber: number, issueUrl: string }   // 201 on success
{ error: string }                           // 4xx / 5xx on failure
```

The component ignores the response body on success — it only checks the HTTP status code.
