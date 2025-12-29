# Pastebin-Lite

A lightweight pastebin application built with Next.js. Users can create text pastes and share them via unique URLs. Pastes can optionally expire based on time (TTL) or view count limits.

## 🚀 Live Application

**Deployed URL**: https://aganitha-cognitive-solutions-pasteb.vercel.app/

**Repository**: https://github.com/PrathamJain2002/Aganitha-Cognitive-Solutions-Pastebin.git

## 📋 Project Description

Pastebin-Lite is a serverless pastebin application that allows users to:
- Create text pastes with arbitrary content
- Share pastes via unique, shareable URLs
- Set optional constraints (time-based expiry and/or view count limits)
- View pastes through both API and HTML interfaces

The application is built with Next.js 16 (App Router) and deployed on Vercel, using Upstash Redis for persistent storage across serverless function invocations.

## 🛠️ How to Run Locally

### Prerequisites
- Node.js 18 or higher
- npm, yarn, pnpm, or bun
- Upstash Redis account (free tier available at https://console.upstash.com/)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrathamJain2002/Aganitha-Cognitive-Solutions-Pastebin.git
   cd Aganitha-Cognitive-Solutions-Pastebin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```
   
   To get your Upstash Redis credentials:
   - Sign up at https://console.upstash.com/
   - Create a new Redis database
   - Copy the REST URL and REST Token from the database details

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production** (optional)
   ```bash
   npm run build
   npm start
   ```

## 💾 Persistence Layer

This application uses **Upstash Redis** as the persistence layer. 

**Why Upstash Redis?**
- Serverless-compatible: Works seamlessly with Vercel's serverless functions
- Persistent storage: Survives across serverless function invocations (unlike in-memory storage)
- No infrastructure management: Fully managed service with automatic scaling
- Free tier available for development and testing

**Data Structure:**
- Key format: `paste:<id>`
- Value: JSON object containing:
  - `id`: Unique paste identifier
  - `content`: Paste text content
  - `createdAt`: Timestamp of creation
  - `ttlSeconds`: Optional time-to-live in seconds
  - `maxViews`: Optional maximum view count
  - `currentViews`: Current number of views

## 🎯 Important Design Decisions

1. **Serverless-First Architecture**: 
   - Built with Next.js App Router for optimal serverless performance
   - No global mutable state (all state stored in Redis)
   - Stateless functions that work correctly in serverless environments

2. **Constraint Enforcement**:
   - Pastes are immediately deleted when constraints trigger (TTL expiry or view limit)
   - Prevents serving pastes beyond their constraints, even under concurrent load
   - Both API and HTML views increment view counts to prevent bypassing limits

3. **Security**:
   - All paste content is HTML-escaped when rendered to prevent XSS attacks
   - Consistent 404 responses for unavailable pastes (no information leakage)
   - No secrets or credentials in code (all via environment variables)

4. **Testing Support**:
   - Supports `TEST_MODE=1` environment variable for deterministic time testing
   - `x-test-now-ms` header allows testers to control time for TTL expiry tests
   - Falls back to real system time when test mode is not enabled

5. **Error Handling**:
   - Input validation using Zod schemas
   - Proper HTTP status codes (400 for invalid input, 404 for unavailable pastes)
   - JSON error responses for all API endpoints

6. **URL Generation**:
   - Dynamically detects base URL from request headers (works on Vercel automatically)
   - No hardcoded URLs in the codebase
   - Supports both development and production environments

## 📡 API Endpoints

### Health Check
- **GET** `/api/healthz`
- Returns: `{ "ok": true }` if service is healthy and can access Redis
- Status: 200

### Create Paste
- **POST** `/api/pastes`
- Request body:
  ```json
  {
    "content": "string (required, non-empty)",
    "ttl_seconds": 60 (optional, integer >= 1),
    "max_views": 5 (optional, integer >= 1)
  }
  ```
- Response (201): `{ "id": "string", "url": "https://your-app.vercel.app/p/<id>" }`
- Error (400): `{ "error": "error message" }` for invalid input

### Get Paste (API)
- **GET** `/api/pastes/:id`
- Response (200): 
  ```json
  {
    "content": "string",
    "remaining_views": 4 (or null if unlimited),
    "expires_at": "2026-01-01T00:00:00.000Z" (or null if no TTL)
  }
  ```
- Error (404): `{ "error": "Paste not found" }` if unavailable
- Note: Each API fetch counts as a view

### View Paste (HTML)
- **GET** `/p/:id`
- Returns: HTML page (200) with paste content
- Error: 404 page if paste is unavailable
- Note: HTML views also count toward view limits

## 🧪 Testing

The application supports deterministic time testing for TTL functionality:

1. Set `TEST_MODE=1` environment variable (automated tests will do this)
2. Send requests with `x-test-now-ms` header containing milliseconds since epoch
3. The application uses this time for expiry checks instead of system time

Example:
```bash
curl -H "x-test-now-ms: 1609459200000" \
     https://aganitha-cognitive-solutions-pasteb.vercel.app/api/pastes/abc123
```

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Persistence**: Upstash Redis
- **Validation**: Zod
- **ID Generation**: nanoid

## 📝 Notes for Evaluators

- All requirements from the assignment specification have been implemented
- The application is deployed and accessible at the URL above
- Repository is public and contains all source code
- No hardcoded localhost URLs or secrets in the codebase
- Application works correctly in serverless environment (tested on Vercel)
- All API endpoints return proper JSON with correct Content-Type headers
- View limits and TTL constraints are enforced correctly
- HTML content is safely rendered (XSS protection)

## 📄 License

MIT
