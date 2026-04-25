# Self-Hosting

The pipeline is built on Vercel for convenience but the architecture is not Vercel-specific. This guide covers running the full stack on your own server using **Dokploy** and **MinIO**.

---

## Target setup

```
Spatial AI Server
└── Firewall + Reverse Proxy (Traefik — ships with Dokploy)
    └── Virtual Machine
        └── Dokploy
            └── Docker Environment
                ├── your-app          (React frontend — Nginx)
                ├── feedback-api      (Node/Express — /api/feedback)
                └── minio             (S3-compatible image storage)
```

The GitHub Issues API and GitHub Actions workflows are external — they require no changes for self-hosting.

---

## What changes vs Vercel

| Vercel component | Self-hosted equivalent |
|---|---|
| Serverless function (`api/feedback.ts`) | Express route (`api-templates/express.ts`) |
| Vercel Blob | MinIO (S3-compatible, runs as a Dokploy service) |
| Vercel env vars | Dokploy environment variable management |
| Vercel CDN | MinIO public bucket or Nginx proxy |

---

## Step 1 — Deploy MinIO

Add MinIO as a Dokploy service using the official Docker image:

```yaml
# docker-compose style — paste into Dokploy compose editor
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: your-access-key
      MINIO_ROOT_PASSWORD: your-secret-key
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Console UI

volumes:
  minio-data:
```

Create a bucket named `feedback-screenshots` and set it to **public read** in the MinIO console.

---

## Step 2 — Deploy the Express API

Copy `api-templates/express.ts` into a minimal Node project, build a Docker image, and deploy as a Dokploy service:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Set these environment variables in Dokploy:

```
GITHUB_TOKEN=...
GITHUB_OWNER=...
GITHUB_REPO=...
S3_ENDPOINT=http://minio:9000
S3_BUCKET=feedback-screenshots
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_PUBLIC_BASE=https://storage.yourdomain.com/feedback-screenshots
```

`S3_PUBLIC_BASE` is the public-facing URL prefix for the bucket — GitHub Issues will embed images from this URL.

---

## Step 3 — Deploy the frontend

Build the React app and serve with Nginx:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Point the Nginx reverse proxy so `/api/feedback` forwards to the Express API service:

```nginx
location /api/ {
  proxy_pass http://feedback-api:3000/api/;
}
```

---

## Step 4 — Configure the component

With everything deployed, update `apiEndpoint` to your domain:

```tsx
<FeedbackKitProvider apiEndpoint="https://yourapp.yourdomain.com/api/feedback">
```

The GitHub Actions workflows require no changes — they consume GitHub Issues events regardless of where the app is hosted.

---

## Traefik routing (Dokploy default)

Dokploy ships Traefik as the reverse proxy. Add labels to each service so Traefik routes subdomains:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.your-app.rule=Host(`yourapp.yourdomain.com`)"
  - "traefik.http.routers.your-app.tls.certresolver=letsencrypt"
```

HTTPS is handled automatically via Let's Encrypt.
