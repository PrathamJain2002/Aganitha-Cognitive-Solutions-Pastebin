# Pastebin-Lite

A lightweight pastebin application built with Next.js. Users can create text pastes and share them via unique URLs. Pastes can optionally expire based on time (TTL) or view count limits.

## Features

- Create text pastes with optional constraints:
  - Time-based expiry (TTL)
  - View count limits
- Share pastes via unique URLs
- Automatic cleanup when constraints are triggered
- Safe HTML rendering (XSS protection)
- Deterministic time support for testing

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Persistence**: Upstash Redis
- **Validation**: Zod

## Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Upstash Redis account (free tier available at https://console.upstash.com/)

## Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd pastebin-lite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

To get your Upstash Redis credentials:
1. Sign up at https://console.upstash.com/
2. Create a new Redis database
3. Copy the REST URL and REST Token from the database details

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/healthz` - Returns `{ "ok": true }` if the service is healthy

### Create Paste
- `POST /api/pastes`
- Request body:
  ```json
  {
    "content": "string (required)",
    "ttl_seconds": 60 (optional, integer >= 1),
    "max_views": 5 (optional, integer >= 1)
  }
  ```
- Response: `{ "id": "string", "url": "https://your-app.vercel.app/p/<id>" }`

### Get Paste (API)
- `GET /api/pastes/:id`
- Response: `{ "content": "string", "remaining_views": 4, "expires_at": "2026-01-01T00:00:00.000Z" }`
- Returns 404 if paste is unavailable (expired, view limit exceeded, or not found)

### View Paste (HTML)
- `GET /p/:id`
- Returns HTML page with the paste content
- Returns 404 if paste is unavailable

## Persistence Layer

This application uses **Upstash Redis** as the persistence layer. Upstash Redis is a serverless Redis service that works seamlessly with serverless platforms like Vercel. It provides:

- Persistent storage across serverless function invocations
- Fast key-value operations
- Automatic scaling
- Free tier available for development

The application stores paste data as JSON in Redis with the following structure:
- Key: `paste:<id>`
- Value: JSON object containing paste content, metadata, and view counts

## Design Decisions

1. **Upstash Redis**: Chosen for its serverless compatibility and ease of use with Vercel deployments. It eliminates the need for managing a separate Redis instance.

2. **View Counting**: Both API and HTML views increment the view counter to prevent bypassing view limits through different endpoints.

3. **Constraint Enforcement**: Pastes are deleted immediately when constraints are triggered to ensure they cannot be accessed again, even with race conditions.

4. **Deterministic Time**: The application supports `TEST_MODE=1` environment variable and `x-test-now-ms` header for testing TTL functionality with deterministic time.

5. **XSS Protection**: All paste content is HTML-escaped when rendered in the HTML view to prevent script execution.

6. **Error Handling**: Consistent 404 responses for all unavailable pastes (expired, view limit exceeded, or not found) to avoid information leakage.

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy

The application will automatically detect the base URL from Vercel's headers.

## Testing

The application supports deterministic time testing for TTL functionality:

1. Set `TEST_MODE=1` environment variable
2. Send requests with `x-test-now-ms` header containing milliseconds since epoch
3. The application will use this time for expiry checks instead of system time

Example:
```bash
curl -H "x-test-now-ms: 1609459200000" https://your-app.vercel.app/api/pastes/abc123
```

## License

MIT
